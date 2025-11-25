import { Component, inject, OnInit, signal, computed, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { EditorModule, TINYMCE_SCRIPT_SRC } from '@tinymce/tinymce-angular';
import { ApiService } from '../../../services/api-service';
import { LoadingService } from '../../../services/loading-service';
import { ICategoryResponse } from '../../../interfaces/category';
import { IPostUpdateRequest } from '../../../interfaces/post';
import { ITagResponse, ITagInput } from '../../../interfaces/tag';
import { CustomSelect, SelectOption } from '../../../components/custom-select/custom-select';
import { TagsInput } from '../../../components/tags-input/tags-input';
import { FilePicker } from '../../../components/file-picker/file-picker';
import { IFileResponse } from '../../../interfaces/file';

@Component({
    selector: 'app-post-edit',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule, EditorModule, CustomSelect, TagsInput, FilePicker],
    providers: [
        { provide: TINYMCE_SCRIPT_SRC, useValue: 'tinymce/tinymce.min.js' }
    ],
    templateUrl: './post-edit.html',
    styleUrl: './post-edit.scss',
})
export class PostEdit implements OnInit {
    private readonly apiService = inject(ApiService);
    private readonly loadingService = inject(LoadingService);
    private readonly formBuilder = inject(FormBuilder);
    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);

    protected readonly categories = signal<ICategoryResponse[]>([]);
    protected readonly allTags = signal<ITagResponse[]>([]);
    private postId: string = '';
    
    protected readonly tagNames = computed<string[]>(() => {
        return this.allTags().map((tag) => tag.name).sort();
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

    protected readonly form: FormGroup = this.formBuilder.group({
        title: ['', [Validators.required, Validators.maxLength(255)]],
        content: ['', [Validators.required]],
        slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)]],
        excerpt: [''],
        tags: [[]],
        category_id: [''],
        thumbnail: [''],
        banner: [''],
        status: ['draft'],
    });

    protected readonly statusOptions: SelectOption[] = [
        { id: 'draft', label: 'Draft' },
        { id: 'published', label: 'Published' },
    ];

    @ViewChild('filePicker') filePickerRef!: FilePicker;
    @ViewChild('thumbnailPicker') thumbnailPickerRef!: FilePicker;
    @ViewChild('bannerPicker') bannerPickerRef!: FilePicker;
    protected selectedThumbnail = signal<IFileResponse | null>(null);
    protected selectedBanner = signal<IFileResponse | null>(null);

    protected readonly editorConfig = {
        height: 500,
        menubar: true,
        plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
        ],
        toolbar: 'undo redo | blocks | ' +
            'bold italic forecolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'insertfile | removeformat | help',
        content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
        setup: (editor: any) => {
            editor.ui.registry.addButton('insertfile', {
                text: 'Insert File',
                tooltip: 'Insert file from gallery',
                onAction: () => {
                    this.openFilePicker();
                }
            });
        },
    };

    public ngOnInit(): void {
        this.postId = this.route.snapshot.paramMap.get('postId') || '';
        if (!this.postId) {
            this.router.navigate(['/posts']);
            return;
        }
        this.loadCategories();
        this.loadTags();
        this.loadPost();
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

    private loadTags(): void {
        this.apiService.getTags().subscribe({
            next: (response) => {
                if (response.success && response.data) {
                    this.allTags.set(response.data);
                }
            },
            error: () => {
                // Handle error silently
            },
        });
    }

    private loadPost(): void {
        this.loadingService.show();
        this.apiService.getPostById(this.postId).subscribe({
            next: (response) => {
                if (response.success && response.data) {
                    const post = response.data;
                    const slugValue = typeof post.slug === 'string' ? post.slug : post.slug?.value || '';
                    // Convert ITagResponse[] to string[] for tags-input component
                    const tagNames = post.tags ? post.tags.map((tag) => tag.name) : [];
                    this.form.patchValue({
                        title: post.title,
                        content: post.content,
                        slug: slugValue,
                        excerpt: post.excerpt || '',
                        tags: tagNames,
                        category_id: post.category?._id || '',
                        thumbnail: post.thumbnail || '',
                        banner: post.banner || '',
                        status: post.status || 'draft',
                    });
                    
                    // Load thumbnail and banner files if they exist
                    // Since thumbnail and banner are now URLs, create file objects from URLs
                    if (post.thumbnail) {
                        const thumbnailFile: IFileResponse = {
                            _id: '',
                            cloudinary_url: post.thumbnail,
                            mime_type: 'image/jpeg',
                            name: 'Thumbnail',
                        };
                        this.selectedThumbnail.set(thumbnailFile);
                    }
                    if (post.banner) {
                        const bannerFile: IFileResponse = {
                            _id: '',
                            cloudinary_url: post.banner,
                            mime_type: 'image/jpeg',
                            name: 'Banner',
                        };
                        this.selectedBanner.set(bannerFile);
                    }
                }
                this.loadingService.hide();
            },
            error: () => {
                this.loadingService.hide();
                this.router.navigate(['/posts']);
            },
        });
    }

    protected generateSlug(): void {
        const title = this.form.value.title;
        if (title && !this.form.value.slug) {
            const slug = title
                .toLowerCase()
                .trim()
                .replace(/[^\w\s-]/g, '')
                .replace(/[\s_-]+/g, '-')
                .replace(/^-+|-+$/g, '');
            this.form.patchValue({ slug });
        }
    }

    protected submit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        // Convert tag names to ITagInput format
        const tagInputs: ITagInput[] = [];
        if (this.form.value.tags && this.form.value.tags.length > 0) {
            this.form.value.tags.forEach((tagName: string) => {
                const existingTag = this.allTags().find((t) => t.name === tagName);
                if (existingTag) {
                    tagInputs.push({ id: existingTag._id, name: existingTag.name });
                } else {
                    tagInputs.push({ name: tagName });
                }
            });
        }

        const request: IPostUpdateRequest = {
            title: this.form.value.title,
            content: this.form.value.content,
            slug: this.form.value.slug,
            excerpt: this.form.value.excerpt || null,
            tags: tagInputs.length > 0 ? tagInputs : null,
            category_id: this.form.value.category_id || null,
            thumbnail: this.selectedThumbnail()?.cloudinary_url || null,
            banner: this.selectedBanner()?.cloudinary_url || null,
        };

        this.loadingService.show();
        this.apiService.updatePost(this.postId, request).subscribe({
            next: (response) => {
                // Handle status change
                const currentStatus = this.form.value.status;
                const wasPublished = response.data?.published_at !== null;
                
                if (currentStatus === 'published' && !wasPublished) {
                    // Publish the post
                    this.apiService.publishPost(this.postId).subscribe({
                        next: () => {
                            this.loadingService.hide();
                            this.router.navigate(['/posts']);
                        },
                        error: () => {
                            this.loadingService.hide();
                            this.router.navigate(['/posts']);
                        },
                    });
                } else if (currentStatus === 'draft' && wasPublished) {
                    // Unpublish the post
                    this.apiService.unpublishPost(this.postId).subscribe({
                        next: () => {
                            this.loadingService.hide();
                            this.router.navigate(['/posts']);
                        },
                        error: () => {
                            this.loadingService.hide();
                            this.router.navigate(['/posts']);
                        },
                    });
                } else {
                    this.loadingService.hide();
                    this.router.navigate(['/posts']);
                }
            },
            error: () => {
                this.loadingService.hide();
            },
        });
    }

    protected get title() {
        return this.form.get('title');
    }

    protected get slug() {
        return this.form.get('slug');
    }

    protected get content() {
        return this.form.get('content');
    }

    protected openFilePicker(): void {
        this.filePickerRef.open();
    }

    protected openThumbnailPicker(): void {
        this.thumbnailPickerRef.open();
    }

    protected openBannerPicker(): void {
        this.bannerPickerRef.open();
    }

    protected onFileSelected(file: IFileResponse): void {
        if (!file.cloudinary_url) {
            return;
        }

        // Try to get the editor instance
        const tinymce = (window as any).tinymce;
        if (tinymce) {
            const editor = tinymce.get('content') || tinymce.activeEditor;
            if (editor) {
                if (file.mime_type?.toLowerCase().startsWith('image/')) {
                    editor.insertContent(`<img src="${file.cloudinary_url}" alt="${file.alt || file.name || ''}" style="max-width: 100%; height: auto;" />`);
                } else {
                    editor.insertContent(`<a href="${file.cloudinary_url}" target="_blank" rel="noopener noreferrer">${file.name || 'Download File'}</a>`);
                }
            }
        }
    }

    protected onThumbnailSelected(file: IFileResponse): void {
        this.selectedThumbnail.set(file);
        this.form.patchValue({ thumbnail: file.cloudinary_url || '' });
    }

    protected onBannerSelected(file: IFileResponse): void {
        this.selectedBanner.set(file);
        this.form.patchValue({ banner: file.cloudinary_url || '' });
    }

    protected removeThumbnail(): void {
        this.selectedThumbnail.set(null);
        this.form.patchValue({ thumbnail: '' });
    }

    protected removeBanner(): void {
        this.selectedBanner.set(null);
        this.form.patchValue({ banner: '' });
    }
}

