import { Component, inject } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../../services/api-service';
import { LoadingService } from '../../../services/loading-service';
import { IRegisterRequest } from '../../../interfaces/user.interface';
import { CustomSelect, SelectOption } from '../../../components/custom-select/custom-select';

@Component({
    selector: 'app-user-create',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule, CustomSelect],
    templateUrl: './user-create.html',
    styleUrl: './user-create.scss',
})
export class UserCreate {
    private readonly apiService = inject(ApiService);
    private readonly loadingService = inject(LoadingService);
    private readonly formBuilder = inject(FormBuilder);
    private readonly router = inject(Router);

    protected readonly roleOptions: SelectOption[] = [
        { id: 'admin', label: 'Admin', name: 'Admin', _id: 'admin' },
        { id: 'writer', label: 'Writer', name: 'Writer', _id: 'writer' },
        { id: 'guest', label: 'Guest', name: 'Guest', _id: 'guest' },
    ];

    protected readonly form: FormGroup = this.formBuilder.group({
        full_name: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirm_password: ['', [Validators.required]],
        date_of_birth: [''],
        role: [''],
    }, {
        validators: this.passwordMatchValidator,
    });

    private passwordMatchValidator(form: FormGroup): { [key: string]: boolean } | null {
        const password = form.get('password');
        const confirmPassword = form.get('confirm_password');
        
        if (password && confirmPassword && password.value !== confirmPassword.value) {
            confirmPassword.setErrors({ passwordMismatch: true });
            return { passwordMismatch: true };
        }
        
        if (confirmPassword?.hasError('passwordMismatch') && password?.value === confirmPassword?.value) {
            confirmPassword.setErrors(null);
        }
        
        return null;
    }

    protected submit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        const formValue = this.form.value;
        const request: IRegisterRequest = {
            full_name: formValue.full_name,
            email: formValue.email,
            password: formValue.password,
            date_of_birth: formValue.date_of_birth 
                ? formatDate(new Date(formValue.date_of_birth), 'yyyy-MM-dd', 'en-US')
                : null,
            role: formValue.role || null,
        };

        this.loadingService.show();
        this.apiService.register(request).subscribe({
            next: () => {
                this.loadingService.hide();
                this.router.navigate(['/users']);
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

    protected get password() {
        return this.form.get('password');
    }

    protected get confirmPassword() {
        return this.form.get('confirm_password');
    }
}

