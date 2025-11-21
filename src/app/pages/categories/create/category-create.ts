import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../../services/api-service';
import { LoadingService } from '../../../services/loading-service';
import { ICategoryCreateRequest, ICategoryResponse } from '../../../interfaces/category';
import { CustomSelect, SelectOption } from '../../../components/custom-select/custom-select';

@Component({
  selector: 'app-category-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, CustomSelect],
  templateUrl: './category-create.html',
  styleUrl: './category-create.scss',
})
export class CategoryCreate implements OnInit {
  private readonly apiService = inject(ApiService);
  private readonly loadingService = inject(LoadingService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);

  protected readonly categories = signal<ICategoryResponse[]>([]);

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
    name: ['', [Validators.required, Validators.maxLength(100)]],
    description: [''],
    slug: [''],
    parent_id: [''],
  });

  public ngOnInit(): void {
    this.loadCategories();
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

  protected submit(): void {
    if (this.form.invalid) {
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
    this.apiService.createCategory(request).subscribe({
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


