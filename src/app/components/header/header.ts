import { Component, inject, computed, signal, HostListener, ElementRef } from '@angular/core';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { StorageService } from '../../services/storage-service';
import { filter } from 'rxjs';

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
  protected readonly currentRoute = signal<string>('');

  constructor() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentRoute.set(event.urlAfterRedirects);
      });
    
    // Set initial route
    this.currentRoute.set(this.router.url);
  }

  protected getCurrentPageTitle(): string {
    const route = this.currentRoute();
    if (route.includes('/home')) return 'Dashboard';
    if (route.includes('/posts')) return 'Posts';
    if (route.includes('/categories')) return 'Categories';
    if (route.includes('/users')) return 'Users';
    if (route.includes('/profile')) return 'Profile';
    return 'Dashboard';
  }

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
