import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../services/api-service';
import { LoadingService } from '../../../services/loading-service';
import { ICategoryResponse } from '../../../interfaces/category';

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

