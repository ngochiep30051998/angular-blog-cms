import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ApiService } from '../../../services/api-service';
import { LoadingService } from '../../../services/loading-service';
import { ICategoryCreateRequest, ICategoryResponse } from '../../../interfaces/category';
import { CustomSelect, SelectOption } from '../../../components/custom-select/custom-select';

@Component({
  selector: 'app-category-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, CustomSelect],
  templateUrl: './category-edit.html',
  styleUrl: './category-edit.scss',
})
export class CategoryEdit implements OnInit {
  private readonly apiService = inject(ApiService);
  private readonly loadingService = inject(LoadingService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly form: FormGroup = this.formBuilder.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    description: [''],
    slug: [''],
    parent_id: [''],
  });

  protected readonly category = signal<ICategoryResponse | null>(null);
  protected readonly categories = signal<ICategoryResponse[]>([]);

  protected readonly categoryOptions = computed<SelectOption[]>(() => {
    return this.categories().map((category) => ({
      id: category._id,
      label: category.name,
      name: category.name,
      _id: category._id,
    }));
  });

  protected readonly childrenCategories = computed<ICategoryResponse[]>(() => {
    return this.category()?.children || [];
  });

  protected categoryId: string | null = null;

  public ngOnInit(): void {
    this.categoryId = this.route.snapshot.paramMap.get('categoryId');
    if (!this.categoryId) {
      this.router.navigate(['/categories']);
      return;
    }
    this.loadCategories();
    this.fetchCategory(this.categoryId);
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

  protected fetchCategory(categoryId: string): void {
    this.loadingService.show();
    this.apiService.getCategoryById(categoryId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.category.set(response.data);
          this.form.patchValue({
            name: response.data.name,
            description: response.data.description ?? '',
            slug: response.data.slug ?? '',
            parent_id: response.data.parent_id ?? '',
          });
        } else {
          this.router.navigate(['/categories']);
        }
        this.loadingService.hide();
      },
      error: () => {
        this.loadingService.hide();
        this.router.navigate(['/categories']);
      },
    });
  }

  protected submit(): void {
    if (this.form.invalid || !this.categoryId) {
      this.form.markAllAsTouched();
      return;
    }

    const request: ICategoryCreateRequest = {
      name: this.form.value.name,
      description: this.form.value.description || null,
      slug: this.form.value.slug || null,
      parent_id: this.form.value.parent_id || null,
    };

    this.loadingService.show();
    this.apiService.updateCategory(this.categoryId, request).subscribe({
      next: () => {
        this.loadingService.hide();
        this.router.navigate(['/categories']);
      },
      error: () => {
        this.loadingService.hide();
      },
    });
  }

  protected get name() {
    return this.form.get('name');
  }
}


