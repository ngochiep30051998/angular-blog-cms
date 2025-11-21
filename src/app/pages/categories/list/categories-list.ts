import { Component, OnInit, inject, signal, computed, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../services/api-service';
import { LoadingService } from '../../../services/loading-service';
import { ModalService } from '../../../services/modal-service';
import { ICategoryResponse } from '../../../interfaces/category';

interface FlatCategory extends ICategoryResponse {
  level: number;
  parentName?: string;
  categoryPath: string[];
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
  private readonly modalService = inject(ModalService);

  @ViewChild('deleteConfirmTemplate') deleteConfirmTemplate!: TemplateRef<unknown>;

  protected readonly categories = signal<ICategoryResponse[]>([]);
  protected readonly expandedCategories = signal<Set<string>>(new Set());
  protected categoryToDelete: string | null = null;

  protected readonly allCategories = computed<FlatCategory[]>(() => {
    const flatList: FlatCategory[] = [];
    const expanded = this.expandedCategories();
    
    const flattenCategories = (
      cats: ICategoryResponse[],
      level: number = 0,
      parentName?: string,
      categoryPath: string[] = []
    ): void => {
      cats.forEach((category) => {
        const currentPath = [...categoryPath, category._id];
        flatList.push({
          ...category,
          level,
          parentName,
          categoryPath: currentPath,
        });
        
        if (category.children && category.children.length > 0 && expanded.has(category._id)) {
          flattenCategories(category.children, level + 1, category.name, currentPath);
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
    if (!category.children) {
      return false;
    }
    if (!Array.isArray(category.children)) {
      return false;
    }
    if (category.children.length === 0) {
      return false;
    }
    // Filter out any null/undefined children and check if there are valid children
    const validChildren = category.children.filter(child => child && child._id);
    return validChildren.length > 0;
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
    this.categoryToDelete = categoryId;
    const modalRef = this.modalService.open(this.deleteConfirmTemplate, {
      title: 'Confirm Delete',
      width: '400px',
      closeOnBackdropClick: true,
      showCloseButton: true,
    });

    modalRef.afterClosed().then((result) => {
      if (result === true && this.categoryToDelete) {
        this.performDelete(this.categoryToDelete);
      }
      this.categoryToDelete = null;
    });
  }

  private performDelete(categoryId: string): void {
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

  protected confirmDelete(): void {
    this.modalService.close(true);
  }

  protected cancelDelete(): void {
    this.modalService.close(false);
  }
}

