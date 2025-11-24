import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { EditorModule, TINYMCE_SCRIPT_SRC } from '@tinymce/tinymce-angular';
import { ApiService } from '../../../services/api-service';
import { LoadingService } from '../../../services/loading-service';
import { ICategoryResponse } from '../../../interfaces/category';
import { IPostCreateRequest } from '../../../interfaces/post';
import { CustomSelect, SelectOption } from '../../../components/custom-select/custom-select';
import { TagsInput } from '../../../components/tags-input/tags-input';

@Component({
    selector: 'app-post-create',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule, EditorModule, CustomSelect, TagsInput],
    providers: [
        { provide: TINYMCE_SCRIPT_SRC, useValue: 'tinymce/tinymce.min.js' }
    ],
    templateUrl: './post-create.html',
    styleUrl: './post-create.scss',
})
export class PostCreate implements OnInit {
    private readonly apiService = inject(ApiService);
    private readonly loadingService = inject(LoadingService);
    private readonly formBuilder = inject(FormBuilder);
    private readonly router = inject(Router);

    protected readonly categories = signal<ICategoryResponse[]>([]);
    protected readonly allTags = signal<string[]>([]);

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
    });

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
            'removeformat | help',
        content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
    };

    public ngOnInit(): void {
        this.loadCategories();
        this.loadAllTags();
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

    private loadAllTags(): void {
        this.apiService.getPosts().subscribe({
            next: (response) => {
                if (response.success && response.data) {
                    const tagSet = new Set<string>();
                    response.data.forEach((post) => {
                        if (post.tags && Array.isArray(post.tags)) {
                            post.tags.forEach((tag) => tagSet.add(tag));
                        }
                    });
                    this.allTags.set(Array.from(tagSet).sort());
                }
            },
            error: () => {
                // Handle error silently
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

        const request: IPostCreateRequest = {
            title: this.form.value.title,
            content: this.form.value.content,
            slug: this.form.value.slug,
            excerpt: this.form.value.excerpt || null,
            tags: this.form.value.tags && this.form.value.tags.length > 0 ? this.form.value.tags : null,
            category_id: this.form.value.category_id || null,
        };

        this.loadingService.show();
        this.apiService.createPost(request).subscribe({
            next: () => {
                this.loadingService.hide();
                this.router.navigate(['/posts']);
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
}

