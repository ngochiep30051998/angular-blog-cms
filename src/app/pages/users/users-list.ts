import { Component, OnInit, inject, signal, computed, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api-service';
import { LoadingService } from '../../services/loading-service';
import { ModalService } from '../../services/modal-service';
import { IUser, IUserLockRequest } from '../../interfaces/user.interface';

@Component({
    selector: 'app-users-list',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './users-list.html',
    styleUrl: './users-list.scss',
})
export class UsersList implements OnInit {
    private readonly apiService = inject(ApiService);
    private readonly loadingService = inject(LoadingService);
    private readonly modalService = inject(ModalService);

    @ViewChild('lockConfirmTemplate') lockConfirmTemplate!: TemplateRef<unknown>;
    @ViewChild('unlockConfirmTemplate') unlockConfirmTemplate!: TemplateRef<unknown>;

    protected readonly users = signal<IUser[]>([]);
    protected readonly currentPage = signal<number>(1);
    protected readonly pageSize = signal<number>(10);
    protected readonly total = signal<number>(0);
    protected readonly totalPages = signal<number>(0);
    protected userToLock: IUser | null = null;
    protected lockAction: 'lock' | 'unlock' | null = null;

    protected readonly pages = computed(() => {
        return Array.from({ length: this.totalPages() }, (_, i) => i + 1);
    });

    protected readonly showingRange = computed(() => {
        const start = (this.currentPage() - 1) * this.pageSize() + 1;
        const end = Math.min(this.currentPage() * this.pageSize(), this.total());
        return { start, end };
    });

    public ngOnInit(): void {
        this.loadUsers();
    }

    protected loadUsers(): void {
        this.loadingService.show();
        this.apiService.getUsers(this.currentPage(), this.pageSize()).subscribe({
            next: (response) => {
                if (response.success && response.data) {
                    this.users.set(response.data);
                    this.total.set(response.total ?? 0);
                    this.totalPages.set(Math.ceil((response.total ?? 0) / this.pageSize()));
                } else {
                    this.users.set([]);
                }
                this.loadingService.hide();
            },
            error: () => {
                this.users.set([]);
                this.loadingService.hide();
            },
        });
    }

    protected toggleLock(user: IUser): void {
        this.userToLock = user;
        this.lockAction = user.locked ? 'unlock' : 'lock';
        const template = this.lockAction === 'lock' ? this.lockConfirmTemplate : this.unlockConfirmTemplate;
        
        const modalRef = this.modalService.open(template, {
            title: this.lockAction === 'lock' ? 'Lock User' : 'Unlock User',
            width: '400px',
            closeOnBackdropClick: true,
            showCloseButton: true,
        });

        modalRef.afterClosed().then((result) => {
            if (result === true && this.userToLock) {
                this.performLockToggle(this.userToLock);
            }
            this.userToLock = null;
            this.lockAction = null;
        });
    }

    private performLockToggle(user: IUser): void {
        const request: IUserLockRequest = {
            locked: !user.locked,
        };

        this.loadingService.show();
        this.apiService.lockUser(user._id, request).subscribe({
            next: () => {
                this.loadUsers();
            },
            error: () => {
                this.loadingService.hide();
            },
        });
    }

    protected confirmLock(): void {
        this.modalService.close(true);
    }

    protected cancelLock(): void {
        this.modalService.close(false);
    }

    protected goToPage(page: number): void {
        if (page >= 1 && page <= this.totalPages()) {
            this.currentPage.set(page);
            this.loadUsers();
        }
    }

    protected previousPage(): void {
        if (this.currentPage() > 1) {
            this.currentPage.update((page) => page - 1);
            this.loadUsers();
        }
    }

    protected nextPage(): void {
        if (this.currentPage() < this.totalPages()) {
            this.currentPage.update((page) => page + 1);
            this.loadUsers();
        }
    }

    protected getLocalDate(dateString: string | null): Date | null {
        if (!dateString) {
            return null;
        }
        // If the date string doesn't have timezone info (no Z or +/- offset),
        // treat it as UTC so it converts to local timezone
        let dateStr = dateString.trim();
        if (!dateStr.endsWith('Z') && !dateStr.match(/[+-]\d{2}:\d{2}$/)) {
            // Append 'Z' to indicate UTC if no timezone info
            dateStr = dateStr + 'Z';
        }
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) {
            return null;
        }
        return date;
    }
}

