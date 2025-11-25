import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../services/api-service';
import { LoadingService } from '../../services/loading-service';
import { ITagCreateRequest } from '../../interfaces/tag';

@Component({
    selector: 'app-tag-create',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
    templateUrl: './tag-create.html',
    styleUrl: './tag-create.scss',
})
export class TagCreate implements OnInit {
    private readonly apiService = inject(ApiService);
    private readonly loadingService = inject(LoadingService);
    private readonly formBuilder = inject(FormBuilder);
    private readonly router = inject(Router);

    protected readonly form: FormGroup = this.formBuilder.group({
        name: ['', [Validators.required, Validators.maxLength(100), Validators.minLength(1)]],
        description: [''],
        slug: [''],
    });

    public ngOnInit(): void {
        // Component initialization
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
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        const request: ITagCreateRequest = {
            name: this.form.value.name,
            description: this.form.value.description || null,
            slug: this.form.value.slug || null,
        };

        this.loadingService.show();
        this.apiService.createTag(request).subscribe({
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

