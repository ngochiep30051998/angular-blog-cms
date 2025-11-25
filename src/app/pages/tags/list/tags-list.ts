import { Component, OnInit, inject, signal, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../services/api-service';
import { LoadingService } from '../../../services/loading-service';
import { ModalService } from '../../../services/modal-service';
import { ITagResponse } from '../../../interfaces/tag';

@Component({
    selector: 'app-tags-list',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './tags-list.html',
    styleUrl: './tags-list.scss',
})
export class TagsList implements OnInit {
    private readonly apiService = inject(ApiService);
    private readonly loadingService = inject(LoadingService);
    private readonly modalService = inject(ModalService);

    @ViewChild('deleteConfirmTemplate') deleteConfirmTemplate!: TemplateRef<unknown>;

    protected readonly tags = signal<ITagResponse[]>([]);
    protected tagToDelete: string | null = null;

    public ngOnInit(): void {
        this.loadTags();
    }

    protected loadTags(): void {
        this.loadingService.show();
        this.apiService.getTags().subscribe({
            next: (response) => {
                if (response.success && response.data) {
                    this.tags.set(response.data);
                } else {
                    this.tags.set([]);
                }
                this.loadingService.hide();
            },
            error: () => {
                this.tags.set([]);
                this.loadingService.hide();
            },
        });
    }

    protected deleteTag(tagId: string): void {
        this.tagToDelete = tagId;
        const modalRef = this.modalService.open(this.deleteConfirmTemplate, {
            title: 'Confirm Delete',
            width: '400px',
            closeOnBackdropClick: true,
            showCloseButton: true,
        });

        modalRef.afterClosed().then((result) => {
            if (result === true && this.tagToDelete) {
                this.performDelete(this.tagToDelete);
            }
            this.tagToDelete = null;
        });
    }

    private performDelete(tagId: string): void {
        this.loadingService.show();
        this.apiService.deleteTag(tagId).subscribe({
            next: () => {
                this.loadTags();
            },
            error: () => {
                this.loadingService.hide();
            },
        });
    }

    protected confirmDelete(): void {
        this.modalService.close(true);
    }

    protected cancelDelete(): void {
        this.modalService.close(false);
    }

    protected getSlugValue(tag: ITagResponse): string {
        return typeof tag.slug === 'string' ? tag.slug : tag.slug?.value || '-';
    }
}

