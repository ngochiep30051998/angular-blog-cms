import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../../services/api-service';
import { LoadingService } from '../../../services/loading-service';
import { StorageService } from '../../../services/storage-service';
import { IUser, IUserUpdateRequest } from '../../../interfaces/user.interface';

@Component({
    selector: 'app-profile-edit',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
    templateUrl: './profile-edit.html',
    styleUrl: './profile-edit.scss',
})
export class ProfileEdit implements OnInit {
    private readonly apiService = inject(ApiService);
    private readonly loadingService = inject(LoadingService);
    private readonly storageService = inject(StorageService);
    private readonly formBuilder = inject(FormBuilder);
    private readonly router = inject(Router);

    protected readonly form: FormGroup = this.formBuilder.group({
        full_name: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        date_of_birth: [''],
    });

    protected readonly user = signal<IUser | null>(null);
    protected readonly currentUser = this.storageService.userProfile;

    public ngOnInit(): void {
        this.loadUserProfile();
    }

    protected loadUserProfile(): void {
        this.loadingService.show();
        this.apiService.getUserProfile().subscribe({
            next: (response) => {
                if (response.success && response.data) {
                    this.user.set(response.data);
                    const dateOfBirth = response.data.date_of_birth
                        ? new Date(response.data.date_of_birth).toISOString().split('T')[0]
                        : '';
                    this.form.patchValue({
                        full_name: response.data.full_name,
                        email: response.data.email,
                        date_of_birth: dateOfBirth,
                    });
                }
                this.loadingService.hide();
            },
            error: () => {
                this.loadingService.hide();
            },
        });
    }

    protected submit(): void {
        if (this.form.invalid || !this.user()) {
            this.form.markAllAsTouched();
            return;
        }

        const formValue = this.form.value;
        const request: IUserUpdateRequest = {
            full_name: formValue.full_name || null,
            email: formValue.email || null,
            date_of_birth: formValue.date_of_birth ? new Date(formValue.date_of_birth).toISOString() : null,
        };

        this.loadingService.show();
        this.apiService.updateUser(this.user()!._id, request).subscribe({
            next: (response) => {
                if (response.success && response.data) {
                    this.storageService.setUserProfile(response.data);
                    this.router.navigate(['/profile']);
                }
                this.loadingService.hide();
            },
            error: () => {
                this.loadingService.hide();
            },
        });
    }

    protected get fullName() {
        return this.form.get('full_name');
    }

    protected get email() {
        return this.form.get('email');
    }
}

