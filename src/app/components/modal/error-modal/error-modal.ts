import { Component, inject, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService } from '../../../services/modal-service';

@Component({
    selector: 'app-error-modal',
    imports: [CommonModule],
    templateUrl: './error-modal.html',
    styleUrl: './error-modal.scss',
    standalone: true,
})
export class ErrorModalComponent implements OnInit {
    private readonly modalService = inject(ModalService);

    @Input() message: string = 'An error occurred. Please try again.';
    @Input() data?: Record<string, unknown>;

    public ngOnInit(): void {
        if (this.data && this.data['message']) {
            this.message = this.data['message'] as string;
        }
    }

    public onConfirm(): void {
        this.modalService.close(true);
    }

    public onClose(): void {
        this.modalService.close(false);
    }
}

