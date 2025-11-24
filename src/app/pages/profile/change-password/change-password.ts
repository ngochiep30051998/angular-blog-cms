import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../../services/api-service';
import { LoadingService } from '../../../services/loading-service';
import { StorageService } from '../../../services/storage-service';
import { IChangePasswordRequest } from '../../../interfaces/user.interface';

@Component({
    selector: 'app-change-password',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
    templateUrl: './change-password.html',
    styleUrl: './change-password.scss',
})
export class ChangePassword implements OnInit {
    private readonly apiService = inject(ApiService);
    private readonly loadingService = inject(LoadingService);
    private readonly storageService = inject(StorageService);
    private readonly formBuilder = inject(FormBuilder);
    private readonly router = inject(Router);

    protected readonly form: FormGroup = this.formBuilder.group({
        old_password: ['', [Validators.required]],
        new_password: ['', [Validators.required, Validators.minLength(6)]],
        confirm_password: ['', [Validators.required]],
    }, {
        validators: this.passwordMatchValidator,
    });

    protected readonly currentUser = this.storageService.userProfile;
    protected readonly errorMessage = signal<string | null>(null);
    protected readonly successMessage = signal<string | null>(null);

    public ngOnInit(): void {
        // Component initialized
    }

    private passwordMatchValidator(form: FormGroup): { [key: string]: boolean } | null {
        const newPassword = form.get('new_password');
        const confirmPassword = form.get('confirm_password');
        
        if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
            confirmPassword.setErrors({ passwordMismatch: true });
            return { passwordMismatch: true };
        }
        
        if (confirmPassword?.hasError('passwordMismatch') && newPassword?.value === confirmPassword?.value) {
            confirmPassword.setErrors(null);
        }
        
        return null;
    }

    protected submit(): void {
        if (this.form.invalid || !this.currentUser()) {
            this.form.markAllAsTouched();
            return;
        }

        this.errorMessage.set(null);
        this.successMessage.set(null);

        const formValue = this.form.value;
        const request: IChangePasswordRequest = {
            old_password: formValue.old_password,
            new_password: formValue.new_password,
        };

        this.loadingService.show();
        this.apiService.changePassword(this.currentUser()!._id, request).subscribe({
            next: () => {
                this.successMessage.set('Password changed successfully!');
                this.form.reset();
                this.loadingService.hide();
                setTimeout(() => {
                    this.router.navigate(['/profile']);
                }, 2000);
            },
            error: (error) => {
                this.errorMessage.set(error.error?.message || 'Failed to change password. Please check your old password.');
                this.loadingService.hide();
            },
        });
    }

    protected get oldPassword() {
        return this.form.get('old_password');
    }

    protected get newPassword() {
        return this.form.get('new_password');
    }

    protected get confirmPassword() {
        return this.form.get('confirm_password');
    }
}

