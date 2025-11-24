import { Component, inject, computed, signal, HostListener, ElementRef, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { StorageService } from '../../services/storage-service';

@Component({
  selector: 'app-header',
  imports: [RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  standalone: true,
})
export class Header {
  private readonly storageService = inject(StorageService);
  private readonly router = inject(Router);
  private readonly elementRef = inject(ElementRef);

  protected readonly userProfile = this.storageService.userProfile;
  protected readonly isDropdownOpen = signal<boolean>(false);

  protected readonly userInitial = computed(() => {
    const user = this.userProfile();
    return user?.full_name?.charAt(0).toUpperCase() || 'A';
  });

  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: MouseEvent): void {
    if (this.isDropdownOpen() && !this.elementRef.nativeElement.contains(event.target)) {
      this.closeDropdown();
    }
  }

  protected toggleDropdown(): void {
    this.isDropdownOpen.update((value) => !value);
  }

  protected closeDropdown(): void {
    this.isDropdownOpen.set(false);
  }

  protected navigateToProfile(): void {
    this.router.navigate(['/profile']);
    this.closeDropdown();
  }

  protected logout(): void {
    this.storageService.token = null;
    this.storageService.setUserProfile(null);
    this.router.navigate(['/login']);
    this.closeDropdown();
  }
}
