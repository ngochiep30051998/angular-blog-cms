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
    writerOnly?: boolean;
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

    public readonly isWriter = computed(() => {
        const role = this.userProfile()?.role;
        return role === 'admin' || role === 'writer';
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
            label: 'Tags',
            route: '/tags',
            icon: './assets/images/svgs/messages.svg',
        },
        {
            label: 'Users',
            route: '/users',
            icon: './assets/images/svgs/employees.svg',
            adminOnly: true,
        },
        {
            label: 'Files',
            route: '/files',
            icon: './assets/images/svgs/documents.svg',
            writerOnly: true,
        }
    ];

    public readonly menuItems = computed<MenuItem[]>(() => {
        const isAdmin = this.isAdmin();
        const isWriter = this.isWriter();
        return this.allMenuItems.filter(item => {
            if (item.adminOnly && !isAdmin) {
                return false;
            }
            if (item.writerOnly && !isWriter) {
                return false;
            }
            return true;
        });
    });

    public toggleCollapse(): void {
        this.isCollapsed.update(value => !value);
    }
}
