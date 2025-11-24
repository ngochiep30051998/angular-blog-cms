import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../services/api-service';
import { StorageService } from '../../services/storage-service';
import { Router } from '@angular/router';
import { LoadingService } from '../../services/loading-service';
import { ModalService } from '../../services/modal-service';
import { ErrorModalComponent } from '../../components/modal/error-modal/error-modal';

@Component({
    selector: 'app-login',
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './login.html',
    styleUrl: './login.scss',
    standalone: true,
})
export class Login {
    private apiService = inject(ApiService)
    private storageService = inject(StorageService)
    private router = inject(Router)
    private loadingService = inject(LoadingService)
    private modalService = inject(ModalService)
    form: FormGroup;

    constructor(private readonly formBuilder: FormBuilder) {
        this.form = this.formBuilder.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
        });
    }

    get email() {
        return this.form.get('email');
    }

    get password() {
        return this.form.get('password');
    }

    onSubmit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }
        // UI only: handle successful validation (no API call)
        // eslint-disable-next-line no-console
        console.log('Login form value', this.form.value);
        this.loadingService.show();
        this.apiService.login(this.form.value).subscribe({
            next: (res) => {
                console.log(res.data)
                const { data, success } = res;
                this.loadingService.hide()
                if(success){
                    const { access_token } = data;
                    this.storageService.token = access_token;
                    this.router.navigate(['/home'])
                } else {
                    // this.modalService.error(message)
                }
                
            },
            error: (err) => {
                this.loadingService.hide()
                console.log(err)
                if(err.status === 401){
                    this.modalService.openError(err?.error?.detail)
                }
            }
        })
    }
}
