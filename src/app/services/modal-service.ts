import { Injectable, TemplateRef, Type } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { IModalConfig, IModalRef } from '../interfaces/modal-config';

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

