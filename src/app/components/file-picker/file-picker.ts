import { Component, inject, OnInit, signal, computed, output, input, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api-service';
import { LoadingService } from '../../services/loading-service';
import { IFileResponse } from '../../interfaces/file';

export type FilePickerMode = 'select' | 'insert';

@Component({
    selector: 'app-file-picker',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './file-picker.html',
    styleUrl: './file-picker.scss',
})
export class FilePicker implements OnInit {
    private readonly apiService = inject(ApiService);
    private readonly loadingService = inject(LoadingService);

    @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

    mode = input<FilePickerMode>('select');
    fileSelected = output<IFileResponse>();
    isOpen = signal<boolean>(false);
    isUploading = signal<boolean>(false);

    protected readonly files = signal<IFileResponse[]>([]);
    protected readonly currentPage = signal<number>(1);
    protected readonly pageSize = signal<number>(20);
    protected readonly total = signal<number>(0);
    protected readonly totalPages = signal<number>(0);

    protected readonly pages = computed(() => {
        return Array.from({ length: this.totalPages() }, (_, i) => i + 1);
    });

    protected readonly imageFiles = computed(() => {
        return this.files().filter(file => {
            const mimeType = file.mime_type?.toLowerCase() || '';
            return mimeType.startsWith('image/');
        });
    });

    public ngOnInit(): void {
        // Component initialized
    }

    public open(): void {
        this.isOpen.set(true);
        this.loadFiles();
    }

    public close(): void {
        this.isOpen.set(false);
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

    protected selectFile(file: IFileResponse): void {
        this.fileSelected.emit(file);
        if (this.mode() === 'select') {
            this.close();
        }
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

