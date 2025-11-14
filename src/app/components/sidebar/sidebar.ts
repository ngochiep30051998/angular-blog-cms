import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
  standalone: true,
})
export class Sidebar {
    public readonly isCollapsed = signal<boolean>(false);

    public readonly menuItems = [
        {
            label: 'Categories',
            route: '/categories',
            icon: '📁',
        },
    ];

    public toggleCollapse(): void {
        this.isCollapsed.update((value) => !value);
    }
}
