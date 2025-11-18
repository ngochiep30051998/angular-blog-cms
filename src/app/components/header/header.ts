import { Component, inject, ChangeDetectorRef } from '@angular/core';
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
  private readonly cdr = inject(ChangeDetectorRef);

  protected get userProfile() {
    return this.storageService.userProfile;
  }

  protected get userInitial(): string {
    const user = this.userProfile;
    return user?.full_name?.charAt(0).toUpperCase() || 'A';
  }

  protected logout(): void {
    this.storageService.token = null;
    this.storageService.userProfile = null;
    this.cdr.detectChanges();
    this.router.navigate(['/login']);
  }
}
