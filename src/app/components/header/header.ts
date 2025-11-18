import { Component, inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from '../../services/storage-service';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  standalone: true,
})
export class Header {
  private readonly storageService = inject(StorageService);
  private readonly router = inject(Router);

  protected readonly userProfile = this.storageService.userProfile;

  protected readonly userInitial = computed(() => {
    const user = this.userProfile();
    return user?.full_name?.charAt(0).toUpperCase() || 'A';
  });

  protected logout(): void {
    this.storageService.token = null;
    this.storageService.setUserProfile(null);
    this.router.navigate(['/login']);
  }
}
