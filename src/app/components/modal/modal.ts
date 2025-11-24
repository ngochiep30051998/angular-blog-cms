import { Component, inject, OnDestroy, TemplateRef, Type, ViewContainerRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal, TemplatePortal } from '@angular/cdk/portal';
import { ModalService } from '../../services/modal-service';
import { IModalConfig } from '../../interfaces/modal-config';
import { Subject, takeUntil } from 'rxjs';
import { ModalContainerComponent } from '../modal-container/modal-container';

@Component({
    selector: 'app-modal',
    imports: [CommonModule],
    templateUrl: './modal.html',
    styleUrl: './modal.scss',
    standalone: true,
})
export class ModalComponent implements OnDestroy {
    private readonly modalService = inject(ModalService);
    private readonly overlay = inject(Overlay);
    private readonly viewContainerRef = inject(ViewContainerRef);

    private overlayRef: OverlayRef | null = null;
    private readonly destroy$ = new Subject<void>();

    constructor() {
        this.modalService.modalState$
            .pipe(takeUntil(this.destroy$))
            .subscribe((config) => {
                if (config) {
                    this.openModal(config);
                } else {
                    this.closeModal();
                }
            });
    }

    private openModal(config: IModalConfig): void {
        const positionStrategy = this.overlay
            .position()
            .global()
            .centerHorizontally()
            .centerVertically();

        const scrollStrategy = this.overlay.scrollStrategies.block();

        this.overlayRef = this.overlay.create({
            positionStrategy,
            scrollStrategy,
            hasBackdrop: true,
            backdropClass: 'modal-backdrop',
            panelClass: 'modal-panel',
            width: config.width,
            height: config.height,
        });

        this.overlayRef.backdropClick().subscribe(() => {
            if (config.closeOnBackdropClick) {
                this.modalService.close();
            }
        });

        if (config.content instanceof TemplateRef) {
            // If it's a template, wrap it in ModalContainerComponent
            const containerPortal = new ComponentPortal(ModalContainerComponent, this.viewContainerRef);
            const containerRef = this.overlayRef.attach(containerPortal);
            containerRef.instance.title = config.title;
            containerRef.instance.showCloseButton = config.showCloseButton ?? true;
            containerRef.instance.contentTemplate = config.content;
            containerRef.instance.data = config.data;
        } else {
            // If it's a component, attach it directly
            const portal = new ComponentPortal(config.content as Type<unknown>, this.viewContainerRef);
            const componentRef = this.overlayRef.attach(portal);
            // Pass data to component if it has a data input
            if (config.data) {
                const instance = componentRef.instance as { data?: Record<string, unknown>; message?: string };
                if ('data' in instance) {
                    instance.data = config.data;
                }
                // Also set message directly if the component has a message input
                if ('message' in instance && config.data['message']) {
                    instance.message = config.data['message'] as string;
                }
            }
        }
    }

    private closeModal(): void {
        if (this.overlayRef) {
            this.overlayRef.detach();
            this.overlayRef.dispose();
            this.overlayRef = null;
        }
    }

    public ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        this.closeModal();
    }
}

