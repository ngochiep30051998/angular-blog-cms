import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IBaseResponse } from '../interfaces/base-response';
import { ILogin, IReqLogin } from '../interfaces/login';

@Injectable({
    providedIn: 'root',
})
export class ApiService {
    private httpClient = inject(HttpClient);
    private readonly apiUrl = environment.apiUrl;

    login(req: IReqLogin): Observable<IBaseResponse<ILogin>> {
        return this.httpClient.post<IBaseResponse<ILogin>>(`${this.apiUrl}/auth/login`, req);
    }
}
