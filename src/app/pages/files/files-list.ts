import { Component, OnInit, inject, signal, computed, TemplateRef, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api-service';
import { LoadingService } from '../../services/loading-service';
import { ModalService } from '../../services/modal-service';
import { IFileResponse } from '../../interfaces/file';

@Component({
    selector: 'app-files-list',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './files-list.html',
    styleUrl: './files-list.scss',
})
export class FilesList implements OnInit {
    private readonly apiService = inject(ApiService);
    private readonly loadingService = inject(LoadingService);
    private readonly modalService = inject(ModalService);

    @ViewChild('deleteConfirmTemplate') deleteConfirmTemplate!: TemplateRef<unknown>;
    @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

    protected readonly files = signal<IFileResponse[]>([]);
    protected readonly currentPage = signal<number>(1);
    protected readonly pageSize = signal<number>(20);
    protected readonly total = signal<number>(0);
    protected readonly totalPages = signal<number>(0);
    protected fileToDelete: string | null = null;
    protected selectedFile: IFileResponse | null = null;
    protected isUploading = signal<boolean>(false);

    protected readonly pages = computed(() => {
        return Array.from({ length: this.totalPages() }, (_, i) => i + 1);
    });

    protected readonly showingRange = computed(() => {
        const start = (this.currentPage() - 1) * this.pageSize() + 1;
        const end = Math.min(this.currentPage() * this.pageSize(), this.total());
        return { start, end };
    });

    protected readonly imageFiles = computed(() => {
        return this.files().filter(file => {
            const mimeType = file.mime_type?.toLowerCase() || '';
            return mimeType.startsWith('image/');
        });
    });

    public ngOnInit(): void {
        this.loadFiles();
    }

    protected loadFiles(): void {
        this.loadingService.show();
        this.apiService.getFiles(this.currentPage(), this.pageSize()).subscribe({
            next: (response) => {
                if (response.success && response.data) {
                    this.files.set(response.data);
                    this.total.set(response.total ?? 0);
                    this.totalPages.set(Math.ceil((response.total ?? 0) / this.pageSize()));
                } else {
                    this.files.set([]);
                }
                this.loadingService.hide();
            },
            error: () => {
                this.files.set([]);
                this.loadingService.hide();
            },
        });
    }

    protected onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            const file = input.files[0];
            this.uploadFile(file);
        }
    }

    protected triggerFileInput(): void {
        this.fileInput.nativeElement.click();
    }

    protected uploadFile(file: File): void {
        this.isUploading.set(true);
        this.loadingService.show();
        this.apiService.uploadFile(file).subscribe({
            next: () => {
                this.isUploading.set(false);
                this.loadFiles();
                if (this.fileInput) {
                    this.fileInput.nativeElement.value = '';
                }
            },
            error: () => {
                this.isUploading.set(false);
                this.loadingService.hide();
            },
        });
    }

    protected deleteFile(fileId: string): void {
        this.fileToDelete = fileId;
        const modalRef = this.modalService.open(this.deleteConfirmTemplate, {
            title: 'Confirm Delete',
            width: '400px',
            closeOnBackdropClick: true,
            showCloseButton: true,
        });

        modalRef.afterClosed().then((result) => {
            if (result === true && this.fileToDelete) {
                this.performDelete(this.fileToDelete);
            }
            this.fileToDelete = null;
        });
    }

    private performDelete(fileId: string): void {
        this.loadingService.show();
        this.apiService.deleteFile(fileId).subscribe({
            next: () => {
                this.loadFiles();
            },
            error: () => {
                this.loadingService.hide();
            },
        });
    }

    protected viewFile(file: IFileResponse): void {
        this.selectedFile = file;
    }

    protected closeViewer(): void {
        this.selectedFile = null;
    }

    protected confirmDelete(): void {
        this.modalService.close(true);
    }

    protected cancelDelete(): void {
        this.modalService.close(false);
    }

    protected goToPage(page: number): void {
        if (page >= 1 && page <= this.totalPages()) {
            this.currentPage.set(page);
            this.loadFiles();
        }
    }

    protected previousPage(): void {
        if (this.currentPage() > 1) {
            this.currentPage.update((page) => page - 1);
            this.loadFiles();
        }
    }

    protected nextPage(): void {
        if (this.currentPage() < this.totalPages()) {
            this.currentPage.update((page) => page + 1);
            this.loadFiles();
        }
    }

    protected isImageFile(file: IFileResponse): boolean {
        const mimeType = file.mime_type?.toLowerCase() || '';
        return mimeType.startsWith('image/');
    }

    protected getFileIcon(mimeType: string): string {
        const type = mimeType?.toLowerCase() || '';
        if (type.startsWith('image/')) {
            return '🖼️';
        }
        if (type.includes('pdf')) {
            return '📄';
        }
        if (type.includes('word') || type.includes('document')) {
            return '📝';
        }
        if (type.includes('video')) {
            return '🎥';
        }
        return '📎';
    }
}

