import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from '../../components/header/header';
import { Sidebar } from '../../components/sidebar/sidebar';
import { ApiService } from '../../services/api-service';
import { StorageService } from '../../services/storage-service';

@Component({
  selector: 'app-private-layout',
  imports: [RouterOutlet, Header, Sidebar],
  templateUrl: './private-layout.html',
  styleUrl: './private-layout.scss',
  standalone: true,
})
export class PrivateLayout implements OnInit {
    private readonly apiService = inject(ApiService);
    private readonly storageService = inject(StorageService);
    private readonly cdr = inject(ChangeDetectorRef);

    public ngOnInit(): void {
        this.loadUserProfile();
    }

    private loadUserProfile(): void {
        if (!this.storageService.userProfile) {
            this.apiService.getUserProfile().subscribe({
                next: (response) => {
                    if (response.success && response.data) {
                        this.storageService.userProfile = response.data;
                        this.cdr.detectChanges();
                    }
                },
                error: () => {
                    // Handle error silently or show notification
                },
            });
        }
    }
}
