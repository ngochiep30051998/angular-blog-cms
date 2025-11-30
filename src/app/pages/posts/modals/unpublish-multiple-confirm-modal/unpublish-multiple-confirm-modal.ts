import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService } from '../../../../services/modal-service';

@Component({
    selector: 'app-unpublish-multiple-confirm-modal',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './unpublish-multiple-confirm-modal.html',
    styleUrl: './unpublish-multiple-confirm-modal.scss',
})
export class UnpublishMultipleConfirmModalComponent implements OnInit {
    private readonly modalService = inject(ModalService);

    @Input() selectedCount: number = 0;
    @Input() data?: Record<string, unknown>;

    public ngOnInit(): void {
        if (this.data && this.data['selectedCount']) {
            this.selectedCount = this.data['selectedCount'] as number;
        }
    }

    public onConfirm(): void {
        this.modalService.close(true);
    }

    public onCancel(): void {
        this.modalService.close(false);
    }
}

