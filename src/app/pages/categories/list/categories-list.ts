import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../services/api-service';
import { LoadingService } from '../../../services/loading-service';
import { ICategoryResponse } from '../../../interfaces/category';

interface FlatCategory extends ICategoryResponse {
  isChild?: boolean;
  parentName?: string;
}

@Component({
  selector: 'app-categories-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './categories-list.html',
  styleUrl: './categories-list.scss',
})
export class CategoriesList implements OnInit {
  private readonly apiService = inject(ApiService);
  private readonly loadingService = inject(LoadingService);

  protected readonly categories = signal<ICategoryResponse[]>([]);
  protected readonly expandedCategories = signal<Set<string>>(new Set());

  protected readonly allCategories = computed<FlatCategory[]>(() => {
    const flatList: FlatCategory[] = [];
    const expanded = this.expandedCategories();
    
    const flattenCategories = (cats: ICategoryResponse[], isChild = false, parentName?: string, parentId?: string) => {
      cats.forEach((category) => {
        flatList.push({
          ...category,
          isChild,
          parentName,
          parent_id: parentId || category.parent_id,
        });
        
        if (category.children && category.children.length > 0 && expanded.has(category._id)) {
          flattenCategories(category.children, true, category.name, category._id);
        }
      });
    };
    
    flattenCategories(this.categories());
    return flatList;
  });

  protected toggleCategory(categoryId: string): void {
    const expanded = new Set(this.expandedCategories());
    if (expanded.has(categoryId)) {
      expanded.delete(categoryId);
    } else {
      expanded.add(categoryId);
    }
    this.expandedCategories.set(expanded);
  }

  protected isExpanded(categoryId: string): boolean {
    return this.expandedCategories().has(categoryId);
  }

  protected hasChildren(category: ICategoryResponse): boolean {
    return category.children && category.children.length > 0;
  }

  public ngOnInit(): void {
    this.loadCategories();
  }

  protected loadCategories(): void {
    this.loadingService.show();
    this.apiService.getCategories().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.categories.set(response.data);
        } else {
          this.categories.set([]);
        }
        this.loadingService.hide();
      },
      error: () => {
        this.categories.set([]);
        this.loadingService.hide();
      },
    });
  }

  protected deleteCategory(categoryId: string): void {
    const confirmDelete = confirm('Are you sure you want to delete this category?');
    if (!confirmDelete) {
      return;
    }

    this.loadingService.show();
    this.apiService.deleteCategory(categoryId).subscribe({
      next: () => {
        this.loadCategories();
      },
      error: () => {
        this.loadingService.hide();
      },
    });
  }
}

