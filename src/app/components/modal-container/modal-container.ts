import { Component, inject, Input, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService } from '../../services/modal-service';

@Component({
    selector: 'app-modal-container',
    imports: [CommonModule],
    templateUrl: './modal-container.html',
    styleUrl: './modal-container.scss',
    standalone: true,
})
export class ModalContainerComponent {
    private readonly modalService = inject(ModalService);

    @Input() title?: string;
    @Input() showCloseButton: boolean = true;
    @Input() contentTemplate?: TemplateRef<unknown>;
    @Input() data?: Record<string, unknown>;

    public onClose(): void {
        this.modalService.close();
    }
}

