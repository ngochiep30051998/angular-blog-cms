import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ApiService } from '../../../services/api-service';
import { LoadingService } from '../../../services/loading-service';
import { ITagUpdateRequest } from '../../../interfaces/tag';

@Component({
    selector: 'app-tag-edit',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
    templateUrl: './tag-edit.html',
    styleUrl: './tag-edit.scss',
})
export class TagEdit implements OnInit {
    private readonly apiService = inject(ApiService);
    private readonly loadingService = inject(LoadingService);
    private readonly formBuilder = inject(FormBuilder);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);

    protected readonly form: FormGroup = this.formBuilder.group({
        name: ['', [Validators.maxLength(100), Validators.minLength(1)]],
        description: [''],
        slug: [''],
    });

    protected tagId: string | null = null;

    public ngOnInit(): void {
        this.tagId = this.route.snapshot.paramMap.get('tagId');
        if (!this.tagId) {
            this.router.navigate(['/tags']);
            return;
        }
        this.loadTag();
    }

    protected loadTag(): void {
        if (!this.tagId) {
            return;
        }
        this.loadingService.show();
        this.apiService.getTagById(this.tagId).subscribe({
            next: (response) => {
                if (response.success && response.data) {
                    const tag = response.data;
                    const slugValue = typeof tag.slug === 'string' ? tag.slug : tag.slug?.value || '';
                    this.form.patchValue({
                        name: tag.name,
                        description: tag.description || '',
                        slug: slugValue,
                    });
                } else {
                    this.router.navigate(['/tags']);
                }
                this.loadingService.hide();
            },
            error: () => {
                this.loadingService.hide();
                this.router.navigate(['/tags']);
            },
        });
    }

    protected generateSlug(): void {
        const name = this.form.value.name;
        if (name && !this.form.value.slug) {
            const slug = name
                .toLowerCase()
                .trim()
                .replace(/[^\w\s-]/g, '')
                .replace(/[\s_-]+/g, '-')
                .replace(/^-+|-+$/g, '');
            this.form.patchValue({ slug });
        }
    }

    protected submit(): void {
        if (this.form.invalid || !this.tagId) {
            this.form.markAllAsTouched();
            return;
        }

        const request: ITagUpdateRequest = {
            name: this.form.value.name || null,
            description: this.form.value.description || null,
            slug: this.form.value.slug || null,
        };

        this.loadingService.show();
        this.apiService.updateTag(this.tagId, request).subscribe({
            next: () => {
                this.loadingService.hide();
                this.router.navigate(['/tags']);
            },
            error: () => {
                this.loadingService.hide();
            },
        });
    }

    protected get name() {
        return this.form.get('name');
    }

    protected get slug() {
        return this.form.get('slug');
    }
}

