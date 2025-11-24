import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService } from '../../../services/modal-service';

@Component({
    selector: 'app-success-modal',
    imports: [CommonModule],
    templateUrl: './success-modal.html',
    styleUrl: './success-modal.scss',
    standalone: true,
})
export class SuccessModalComponent implements OnInit {
    private readonly modalService = inject(ModalService);

    @Input() message: string = 'Operation completed successfully!';
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

