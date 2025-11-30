import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService } from '../../../../services/modal-service';

@Component({
    selector: 'app-publish-confirm-modal',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './publish-confirm-modal.html',
    styleUrl: './publish-confirm-modal.scss',
})
export class PublishConfirmModalComponent implements OnInit {
    private readonly modalService = inject(ModalService);

    @Input() postTitle?: string;
    @Input() data?: Record<string, unknown>;

    public ngOnInit(): void {
        if (this.data && this.data['postTitle']) {
            this.postTitle = this.data['postTitle'] as string;
        }
    }

    public onConfirm(): void {
        this.modalService.close(true);
    }

    public onCancel(): void {
        this.modalService.close(false);
    }
}

