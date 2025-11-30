import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService } from '../../../../services/modal-service';

@Component({
    selector: 'app-delete-confirm-modal',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './delete-confirm-modal.html',
    styleUrl: './delete-confirm-modal.scss',
})
export class DeleteConfirmModalComponent {
    private readonly modalService = inject(ModalService);

    @Input() postTitle?: string;

    public onConfirm(): void {
        this.modalService.close(true);
    }

    public onCancel(): void {
        this.modalService.close(false);
    }
}

