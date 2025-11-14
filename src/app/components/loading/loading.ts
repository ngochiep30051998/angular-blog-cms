import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../services/loading-service';

@Component({
  selector: 'app-loading',
  imports: [CommonModule],
  templateUrl: './loading.html',
  styleUrl: './loading.scss',
  standalone: true,
})
export class Loading {
    private readonly loadingService = inject(LoadingService);
    public readonly loading$ = this.loadingService.loading$;
}
