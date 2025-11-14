import { Component, inject } from '@angular/core';
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

  protected logout(): void {
    this.storageService.token = null;
    this.router.navigate(['/login']);
  }
}
