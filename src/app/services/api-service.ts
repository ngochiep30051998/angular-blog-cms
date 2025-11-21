import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IBaseResponse } from '../interfaces/base-response';
import { ILogin, IReqLogin } from '../interfaces/login';
import { ICategoryCreateRequest, ICategoryResponse } from '../interfaces/category';
import { IUser } from '../interfaces/user.interface';

@Injectable({
    providedIn: 'root',
})
export class ApiService {
    private httpClient = inject(HttpClient);
    private readonly apiUrl = environment.apiUrl;

    login(req: IReqLogin): Observable<IBaseResponse<ILogin>> {
        return this.httpClient.post<IBaseResponse<ILogin>>(`${this.apiUrl}/auth/login`, req);
    }

    getCategories(page?: number, pageSize?: number): Observable<IBaseResponse<ICategoryResponse[]>> {
        let params = new HttpParams();
        if (page) {
            params = params.set('page', page.toString());
        }
        if (pageSize) {
            params = params.set('page_size', pageSize.toString());
        }
        return this.httpClient.get<IBaseResponse<ICategoryResponse[]>>(`${this.apiUrl}/categories`, { params });
    }

    getCategoryById(categoryId: string): Observable<IBaseResponse<ICategoryResponse>> {
        return this.httpClient.get<IBaseResponse<ICategoryResponse>>(`${this.apiUrl}/categories/${categoryId}`);
    }

    createCategory(req: ICategoryCreateRequest): Observable<IBaseResponse<ICategoryResponse>> {
        return this.httpClient.post<IBaseResponse<ICategoryResponse>>(`${this.apiUrl}/categories`, req);
    }

    updateCategory(categoryId: string, req: ICategoryCreateRequest): Observable<IBaseResponse<ICategoryResponse>> {
        return this.httpClient.patch<IBaseResponse<ICategoryResponse>>(`${this.apiUrl}/categories/${categoryId}`, req);
    }

    deleteCategory(categoryId: string): Observable<IBaseResponse<boolean>> {
        return this.httpClient.delete<IBaseResponse<boolean>>(`${this.apiUrl}/categories/${categoryId}`);
    }

    getUserProfile(): Observable<IBaseResponse<IUser>> {
        return this.httpClient.get<IBaseResponse<IUser>>(`${this.apiUrl}/users/profile`);
    }
}
