import { Component, OnInit, inject, signal, computed, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api-service';
import { LoadingService } from '../../../services/loading-service';
import { ModalService } from '../../../services/modal-service';
import { IPostResponse } from '../../../interfaces/post';
import { ICategoryResponse } from '../../../interfaces/category';
import { CustomSelect, SelectOption } from '../../../components/custom-select/custom-select';

@Component({
    selector: 'app-posts-list',
    standalone: true,
    imports: [CommonModule, RouterModule, ReactiveFormsModule, CustomSelect],
    templateUrl: './posts-list.html',
    styleUrl: './posts-list.scss',
})
export class PostsList implements OnInit {
    private readonly apiService = inject(ApiService);
    private readonly loadingService = inject(LoadingService);
    private readonly modalService = inject(ModalService);
    private readonly formBuilder = inject(FormBuilder);

    @ViewChild('deleteConfirmTemplate') deleteConfirmTemplate!: TemplateRef<unknown>;
    @ViewChild('publishConfirmTemplate') publishConfirmTemplate!: TemplateRef<unknown>;
    @ViewChild('unpublishConfirmTemplate') unpublishConfirmTemplate!: TemplateRef<unknown>;

    protected readonly posts = signal<IPostResponse[]>([]);
    protected readonly categories = signal<ICategoryResponse[]>([]);
    protected readonly currentPage = signal<number>(1);
    protected readonly pageSize = signal<number>(10);
    protected readonly total = signal<number>(0);
    protected readonly totalPages = signal<number>(0);
    protected postToDelete: string | null = null;
    protected postToPublish: IPostResponse | null = null;
    protected publishAction: 'publish' | 'unpublish' | null = null;

    protected readonly filterForm: FormGroup = this.formBuilder.group({
        category_id: [''],
        title: [''],
        tag: [''],
        status: [''],
    });

    protected readonly categoryOptions = computed<SelectOption[]>(() => {
        const options: SelectOption[] = [];
        
        const flattenCategories = (cats: ICategoryResponse[], level: number = 0): void => {
            cats.forEach((category) => {
                options.push({
                    id: category._id,
                    label: category.name,
                    name: category.name,
                    _id: category._id,
                    level: level,
                });
                
                if (category.children && category.children.length > 0) {
                    flattenCategories(category.children, level + 1);
                }
            });
        };
        
        flattenCategories(this.categories());
        return options;
    });

    protected readonly pages = computed(() => {
        return Array.from({ length: this.totalPages() }, (_, i) => i + 1);
    });

    protected readonly showingRange = computed(() => {
        const start = (this.currentPage() - 1) * this.pageSize() + 1;
        const end = Math.min(this.currentPage() * this.pageSize(), this.total());
        return { start, end };
    });

    protected readonly allTags = computed(() => {
        const tagSet = new Set<string>();
        this.posts().forEach((post) => {
            if (post.tags && Array.isArray(post.tags)) {
                post.tags.forEach((tag) => tagSet.add(tag));
            }
        });
        return Array.from(tagSet).sort();
    });

    public ngOnInit(): void {
        this.loadCategories();
        this.loadPosts();
    }

    private loadCategories(): void {
        this.apiService.getCategories().subscribe({
            next: (response) => {
                if (response.success && response.data) {
                    this.categories.set(response.data);
                }
            },
            error: () => {
                // Handle error silently
            },
        });
    }

    protected loadPosts(): void {
        this.loadingService.show();
        this.apiService.getPosts(this.currentPage(), this.pageSize()).subscribe({
            next: (response) => {
                if (response.success && response.data) {
                    let filteredPosts = response.data;
                    
                    // Apply filters
                    const filters = this.filterForm.value;
                    if (filters.category_id) {
                        filteredPosts = filteredPosts.filter((post) => 
                            post.category?._id === filters.category_id
                        );
                    }
                    if (filters.title) {
                        const titleLower = filters.title.toLowerCase();
                        filteredPosts = filteredPosts.filter((post) => 
                            post.title.toLowerCase().includes(titleLower)
                        );
                    }
                    if (filters.tag) {
                        filteredPosts = filteredPosts.filter((post) => 
                            post.tags && post.tags.some((tag) => 
                                tag.toLowerCase().includes(filters.tag.toLowerCase())
                            )
                        );
                    }
                    if (filters.status) {
                        filteredPosts = filteredPosts.filter((post) => 
                            post.status === filters.status
                        );
                    }
                    
                    this.posts.set(filteredPosts);
                    this.total.set(response.total ?? 0);
                    this.totalPages.set(Math.ceil((response.total ?? 0) / this.pageSize()));
                } else {
                    this.posts.set([]);
                }
                this.loadingService.hide();
            },
            error: () => {
                this.posts.set([]);
                this.loadingService.hide();
            },
        });
    }

    protected applyFilters(): void {
        this.currentPage.set(1);
        this.loadPosts();
    }

    protected clearFilters(): void {
        this.filterForm.reset();
        this.currentPage.set(1);
        this.loadPosts();
    }

    protected deletePost(postId: string): void {
        this.postToDelete = postId;
        const modalRef = this.modalService.open(this.deleteConfirmTemplate, {
            title: 'Confirm Delete',
            width: '400px',
            closeOnBackdropClick: true,
            showCloseButton: true,
        });

        modalRef.afterClosed().then((result) => {
            if (result === true && this.postToDelete) {
                this.performDelete(this.postToDelete);
            }
            this.postToDelete = null;
        });
    }

    private performDelete(postId: string): void {
        this.loadingService.show();
        this.apiService.deletePost(postId).subscribe({
            next: () => {
                this.loadPosts();
            },
            error: () => {
                this.loadingService.hide();
            },
        });
    }

    protected togglePublish(post: IPostResponse): void {
        this.postToPublish = post;
        this.publishAction = post.published_at ? 'unpublish' : 'publish';
        const template = this.publishAction === 'publish' 
            ? this.publishConfirmTemplate 
            : this.unpublishConfirmTemplate;
        
        const modalRef = this.modalService.open(template, {
            title: this.publishAction === 'publish' ? 'Publish Post' : 'Unpublish Post',
            width: '400px',
            closeOnBackdropClick: true,
            showCloseButton: true,
        });

        modalRef.afterClosed().then((result) => {
            if (result === true && this.postToPublish) {
                // Note: The API doesn't have a publish/unpublish endpoint in the OpenAPI spec
                // This would need to be implemented on the backend or handled via update
                // For now, we'll just show the confirmation
                this.loadPosts();
            }
            this.postToPublish = null;
            this.publishAction = null;
        });
    }

    protected confirmDelete(): void {
        this.modalService.close(true);
    }

    protected cancelDelete(): void {
        this.modalService.close(false);
    }

    protected confirmPublish(): void {
        this.modalService.close(true);
    }

    protected cancelPublish(): void {
        this.modalService.close(false);
    }

    protected goToPage(page: number): void {
        if (page >= 1 && page <= this.totalPages()) {
            this.currentPage.set(page);
            this.loadPosts();
        }
    }

    protected previousPage(): void {
        if (this.currentPage() > 1) {
            this.currentPage.update((page) => page - 1);
            this.loadPosts();
        }
    }

    protected nextPage(): void {
        if (this.currentPage() < this.totalPages()) {
            this.currentPage.update((page) => page + 1);
            this.loadPosts();
        }
    }

    protected getStatusBadgeClass(status: string): string {
        switch (status.toLowerCase()) {
            case 'published':
                return 'px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium';
            case 'draft':
                return 'px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium';
            case 'archived':
                return 'px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium';
            default:
                return 'px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium';
        }
    }
}

