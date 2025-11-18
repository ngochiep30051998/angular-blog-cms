import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface MenuItem {
    label: string;
    route: string;
    icon: string;
    badge?: number;
}

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
  standalone: true,
})
export class Sidebar {
    public readonly isCollapsed = signal<boolean>(false);

    public readonly menuItems: MenuItem[] = [
        {
            label: 'Dashboard',
            route: '/home',
            icon: './assets/images/svgs/dashboard.svg',
        },
        {
            label: 'Categories',
            route: '/categories',
            icon: './assets/images/svgs/messages.svg',
            badge: 10,
        }
    ];

    public toggleCollapse(): void {
        this.isCollapsed.update((value) => !value);
    }
}
