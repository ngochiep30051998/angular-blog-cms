import { TemplateRef, Type } from '@angular/core';

export interface IModalConfig {
    title?: string;
    content: TemplateRef<unknown> | Type<unknown>;
    data?: Record<string, unknown>;
    width?: string;
    height?: string;
    closeOnBackdropClick?: boolean;
    showCloseButton?: boolean;
}

export interface IModalRef<T = unknown> {
    close: (result?: T) => void;
    afterClosed: () => Promise<T>;
}

