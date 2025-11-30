import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../../services/api-service';
import { LoadingService } from '../../../services/loading-service';
import { ModalService } from '../../../services/modal-service';
import { IPostResponse } from '../../../interfaces/post';
import { ICategoryResponse } from '../../../interfaces/category';
import { CustomSelect, SelectOption } from '../../../components/custom-select/custom-select';
import { DeleteConfirmModalComponent } from '../modals/delete-confirm-modal/delete-confirm-modal';
import { PublishConfirmModalComponent } from '../modals/publish-confirm-modal/publish-confirm-modal';
import { UnpublishConfirmModalComponent } from '../modals/unpublish-confirm-modal/unpublish-confirm-modal';
import { PublishMultipleConfirmModalComponent } from '../modals/publish-multiple-confirm-modal/publish-multiple-confirm-modal';
import { DeleteMultipleConfirmModalComponent } from '../modals/delete-multiple-confirm-modal/delete-multiple-confirm-modal';
import { UnpublishMultipleConfirmModalComponent } from '../modals/unpublish-multiple-confirm-modal/unpublish-multiple-confirm-modal';

@Component({
    selector: 'app-posts-list',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        ReactiveFormsModule,
        CustomSelect,
        DeleteConfirmModalComponent,
        PublishConfirmModalComponent,
        UnpublishConfirmModalComponent,
        PublishMultipleConfirmModalComponent,
        DeleteMultipleConfirmModalComponent,
        UnpublishMultipleConfirmModalComponent,
    ],
    templateUrl: './posts-list.html',
    styleUrl: './posts-list.scss',
})
export class PostsList implements OnInit {
    private readonly apiService = inject(ApiService);
    private readonly loadingService = inject(LoadingService);
    private readonly modalService = inject(ModalService);
    private readonly formBuilder = inject(FormBuilder);


    protected readonly posts = signal<IPostResponse[]>([]);
    protected readonly categories = signal<ICategoryResponse[]>([]);
    protected readonly currentPage = signal<number>(1);
    protected readonly pageSize = signal<number>(10);
    protected readonly total = signal<number>(0);
    protected readonly totalPages = signal<number>(0);
    protected readonly selectedPostIds = signal<Set<string>>(new Set());
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
                post.tags.forEach((tag) => tagSet.add(tag.name));
            }
        });
        return Array.from(tagSet).sort();
    });

    protected readonly isAllSelected = computed(() => {
        const posts = this.posts();
        if (posts.length === 0) return false;
        return posts.every((post) => this.selectedPostIds().has(post._id));
    });

    protected readonly hasSelectedPosts = computed(() => {
        return this.selectedPostIds().size > 0;
    });

    protected readonly statusOptions: SelectOption[] = [
        { id: '', label: 'All Statuses' },
        { id: 'published', label: 'Published' },
        { id: 'draft', label: 'Draft' },
        { id: 'archived', label: 'Archived' },
    ];

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
                                tag.name.toLowerCase().includes(filters.tag.toLowerCase())
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
                    // Clear selections when posts are reloaded
                    this.selectedPostIds.set(new Set());
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
        const modalRef = this.modalService.open(DeleteConfirmModalComponent, {
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
        const modalComponent = this.publishAction === 'publish' 
            ? PublishConfirmModalComponent 
            : UnpublishConfirmModalComponent;
        
        const modalRef = this.modalService.open(modalComponent, {
            title: this.publishAction === 'publish' ? 'Publish Post' : 'Unpublish Post',
            width: '400px',
            closeOnBackdropClick: true,
            showCloseButton: true,
            data: { postTitle: post.title },
        });

        modalRef.afterClosed().then((result) => {
            if (result === true && this.postToPublish) {
                if (this.publishAction === 'publish') {
                    this.performPublish(this.postToPublish._id);
                } else {
                    this.performUnpublish(this.postToPublish);
                }
            }
            this.postToPublish = null;
            this.publishAction = null;
        });
    }

    private performPublish(postId: string): void {
        this.loadingService.show();
        this.apiService.publishPost(postId).subscribe({
            next: () => {
                this.loadPosts();
            },
            error: () => {
                this.loadingService.hide();
            },
        });
    }

    private performUnpublish(post: IPostResponse): void {
        this.loadingService.show();
        // Try to call unpublish endpoint (may not exist in API, will handle error if it doesn't)
        this.apiService.unpublishPost(post._id).subscribe({
            next: () => {
                this.loadPosts();
            },
            error: () => {
                this.loadingService.hide();
            },
        });
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
                return 'px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold';
            case 'draft':
                return 'px-2 py-1 bg-gray-100 text-[#2D3748] rounded-full text-xs font-bold';
            case 'archived':
                return 'px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold';
            default:
                return 'px-2 py-1 bg-[#4FD1C5] bg-opacity-20 text-[#4FD1C5] rounded-full text-xs font-bold';
        }
    }

    protected togglePostSelection(postId: string): void {
        const selected = new Set(this.selectedPostIds());
        if (selected.has(postId)) {
            selected.delete(postId);
        } else {
            selected.add(postId);
        }
        this.selectedPostIds.set(selected);
    }

    protected toggleSelectAll(): void {
        const posts = this.posts();
        const selected = new Set(this.selectedPostIds());
        
        if (this.isAllSelected()) {
            // Deselect all
            posts.forEach((post) => selected.delete(post._id));
        } else {
            // Select all
            posts.forEach((post) => selected.add(post._id));
        }
        this.selectedPostIds.set(selected);
    }

    protected isPostSelected(postId: string): boolean {
        return this.selectedPostIds().has(postId);
    }

    protected publishMultiplePosts(): void {
        const selectedIds = Array.from(this.selectedPostIds());
        if (selectedIds.length === 0) {
            return;
        }

        const modalRef = this.modalService.open(PublishMultipleConfirmModalComponent, {
            title: 'Publish Multiple Posts',
            width: '400px',
            closeOnBackdropClick: true,
            showCloseButton: true,
            data: { selectedCount: selectedIds.length },
        });

        modalRef.afterClosed().then((result) => {
            if (result === true) {
                this.performPublishMultiple(selectedIds);
            }
        });
    }

    private performPublishMultiple(postIds: string[]): void {
        this.loadingService.show();
        const publishObservables = postIds.map((postId) => 
            this.apiService.publishPost(postId)
        );

        forkJoin(publishObservables).subscribe({
            next: () => {
                this.selectedPostIds.set(new Set());
                this.loadPosts();
            },
            error: () => {
                this.loadingService.hide();
                // Still reload to show current state
                this.selectedPostIds.set(new Set());
                this.loadPosts();
            },
        });
    }

    protected deleteMultiplePosts(): void {
        const selectedIds = Array.from(this.selectedPostIds());
        if (selectedIds.length === 0) {
            return;
        }

        const modalRef = this.modalService.open(DeleteMultipleConfirmModalComponent, {
            title: 'Delete Multiple Posts',
            width: '400px',
            closeOnBackdropClick: true,
            showCloseButton: true,
            data: { selectedCount: selectedIds.length },
        });

        modalRef.afterClosed().then((result) => {
            if (result === true) {
                this.performDeleteMultiple(selectedIds);
            }
        });
    }

    private performDeleteMultiple(postIds: string[]): void {
        this.loadingService.show();
        const deleteObservables = postIds.map((postId) => 
            this.apiService.deletePost(postId)
        );

        forkJoin(deleteObservables).subscribe({
            next: () => {
                this.selectedPostIds.set(new Set());
                this.loadPosts();
            },
            error: () => {
                this.loadingService.hide();
                // Still reload to show current state
                this.selectedPostIds.set(new Set());
                this.loadPosts();
            },
        });
    }

    protected unpublishMultiplePosts(): void {
        const selectedIds = Array.from(this.selectedPostIds());
        if (selectedIds.length === 0) {
            return;
        }

        const modalRef = this.modalService.open(UnpublishMultipleConfirmModalComponent, {
            title: 'Unpublish Multiple Posts',
            width: '400px',
            closeOnBackdropClick: true,
            showCloseButton: true,
            data: { selectedCount: selectedIds.length },
        });

        modalRef.afterClosed().then((result) => {
            if (result === true) {
                this.performUnpublishMultiple(selectedIds);
            }
        });
    }

    private performUnpublishMultiple(postIds: string[]): void {
        this.loadingService.show();
        const unpublishObservables = postIds.map((postId) => 
            this.apiService.unpublishPost(postId)
        );

        forkJoin(unpublishObservables).subscribe({
            next: () => {
                this.selectedPostIds.set(new Set());
                this.loadPosts();
            },
            error: () => {
                this.loadingService.hide();
                // Still reload to show current state
                this.selectedPostIds.set(new Set());
                this.loadPosts();
            },
        });
    }
}

