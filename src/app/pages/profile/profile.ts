import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api-service';
import { LoadingService } from '../../services/loading-service';
import { StorageService } from '../../services/storage-service';
import { IUser } from '../../interfaces/user.interface';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './profile.html',
    styleUrl: './profile.scss',
})
export class Profile implements OnInit {
    private readonly apiService = inject(ApiService);
    private readonly loadingService = inject(LoadingService);
    private readonly storageService = inject(StorageService);

    protected readonly user = signal<IUser | null>(null);
    protected readonly currentUser = this.storageService.userProfile;

    public ngOnInit(): void {
        this.loadUserProfile();
    }

    protected loadUserProfile(): void {
        this.loadingService.show();
        this.apiService.getUserProfile().subscribe({
            next: (response) => {
                if (response.success && response.data) {
                    this.user.set(response.data);
                    this.storageService.setUserProfile(response.data);
                }
                this.loadingService.hide();
            },
            error: () => {
                this.loadingService.hide();
            },
        });
    }

    protected formatDate(date: string | null): string {
        if (!date) {
            return '-';
        }
        return new Date(date).toLocaleDateString();
    }
}

