import { Injectable, TemplateRef, Type } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { IModalConfig, IModalRef } from '../interfaces/modal-config';
import { SuccessModalComponent } from '../components/modal/success-modal/success-modal';
import { ErrorModalComponent } from '../components/modal/error-modal/error-modal';
import { WarningModalComponent } from '../components/modal/warning-modal/warning-modal';

@Injectable({
    providedIn: 'root',
})
export class ModalService {
    private readonly modalStateSubject = new BehaviorSubject<IModalConfig | null>(null);
    public readonly modalState$: Observable<IModalConfig | null> = this.modalStateSubject.asObservable();

    private resolveCallback: ((value: unknown) => void) | null = null;

    public open<T = unknown>(
        content: TemplateRef<unknown> | Type<unknown>,
        config?: Partial<IModalConfig>
    ): IModalRef<T> {
        const modalConfig: IModalConfig = {
            content,
            title: config?.title,
            data: config?.data,
            width: config?.width || '500px',
            height: config?.height,
            closeOnBackdropClick: config?.closeOnBackdropClick ?? true,
            showCloseButton: config?.showCloseButton ?? true,
        };

        this.modalStateSubject.next(modalConfig);

        return {
            close: (result?: T) => this.close(result),
            afterClosed: () => this.afterClosed<T>(),
        };
    }

    public openSuccess(message?: string): IModalRef<boolean> {
        return this.open<boolean>(SuccessModalComponent, {
            data: message ? { message } : undefined,
            width: '450px',
            showCloseButton: false,
            closeOnBackdropClick: false,
        });
    }

    public openError(message?: string): IModalRef<boolean> {
        return this.open<boolean>(ErrorModalComponent, {
            data: message ? { message } : undefined,
            width: '450px',
            showCloseButton: false,
            closeOnBackdropClick: false,
        });
    }

    public openWarning(message?: string): IModalRef<boolean> {
        return this.open<boolean>(WarningModalComponent, {
            data: message ? { message } : undefined,
            width: '450px',
            showCloseButton: false,
            closeOnBackdropClick: false,
        });
    }

    public close(result?: unknown): void {
        this.modalStateSubject.next(null);
        if (this.resolveCallback) {
            this.resolveCallback(result);
            this.resolveCallback = null;
        }
    }

    private afterClosed<T = unknown>(): Promise<T> {
        return new Promise<T>((resolve) => {
            this.resolveCallback = resolve as (value: unknown) => void;
        });
    }

    public getCurrentModal(): IModalConfig | null {
        return this.modalStateSubject.value;
    }
}

