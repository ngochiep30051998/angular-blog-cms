import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StorageService } from '../../services/storage-service';

interface MenuItem {
    label: string;
    route: string;
    icon: string;
    badge?: number;
    adminOnly?: boolean;
}

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
  standalone: true,
})
export class Sidebar {
    private readonly storageService = inject(StorageService);

    public readonly userProfile = this.storageService.userProfile;

    public readonly isCollapsed = signal<boolean>(false);

    public readonly isAdmin = computed(() => {
        return this.userProfile()?.role === 'admin';
    });

    public readonly allMenuItems: MenuItem[] = [
        {
            label: 'Dashboard',
            route: '/home',
            icon: './assets/images/svgs/dashboard.svg',
        },
        {
            label: 'Posts',
            route: '/posts',
            icon: './assets/images/svgs/jobs.svg',
        },
        {
            label: 'Categories',
            route: '/categories',
            icon: './assets/images/svgs/messages.svg',
        },
        {
            label: 'Users',
            route: '/users',
            icon: './assets/images/svgs/employees.svg',
            adminOnly: true,
        }
    ];

    public readonly menuItems = computed<MenuItem[]>(() => {
        const isAdmin = this.isAdmin();
        return this.allMenuItems.filter(item => !item.adminOnly || isAdmin);
    });

    public toggleCollapse(): void {
        this.isCollapsed.update(value => !value);
    }
}
