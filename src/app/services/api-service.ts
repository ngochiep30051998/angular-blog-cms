import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IBaseResponse } from '../interfaces/base-response';
import { ILogin, IReqLogin } from '../interfaces/login';
import { ICategoryCreateRequest, ICategoryResponse } from '../interfaces/category';
import { IUser, IUserUpdateRequest, IUserLockRequest, IChangePasswordRequest, IRegisterRequest } from '../interfaces/user.interface';
import { IPostCreateRequest, IPostResponse } from '../interfaces/post';

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

    getUsers(page?: number, pageSize?: number): Observable<IBaseResponse<IUser[]>> {
        let params = new HttpParams();
        if (page) {
            params = params.set('page', page.toString());
        }
        if (pageSize) {
            params = params.set('page_size', pageSize.toString());
        }
        return this.httpClient.get<IBaseResponse<IUser[]>>(`${this.apiUrl}/users`, { params });
    }

    updateUser(userId: string, req: IUserUpdateRequest): Observable<IBaseResponse<IUser>> {
        return this.httpClient.patch<IBaseResponse<IUser>>(`${this.apiUrl}/users/${userId}`, req);
    }

    lockUser(userId: string, req: IUserLockRequest): Observable<IBaseResponse<IUser>> {
        return this.httpClient.patch<IBaseResponse<IUser>>(`${this.apiUrl}/users/${userId}/lock`, req);
    }

    changePassword(userId: string, req: IChangePasswordRequest): Observable<IBaseResponse<Record<string, unknown>>> {
        return this.httpClient.patch<IBaseResponse<Record<string, unknown>>>(`${this.apiUrl}/users/${userId}/change-password`, req);
    }

    register(req: IRegisterRequest): Observable<IBaseResponse<ILogin>> {
        return this.httpClient.post<IBaseResponse<ILogin>>(`${this.apiUrl}/auth/register`, req);
    }

    getPosts(page?: number, pageSize?: number): Observable<IBaseResponse<IPostResponse[]>> {
        let params = new HttpParams();
        if (page) {
            params = params.set('page', page.toString());
        }
        if (pageSize) {
            params = params.set('page_size', pageSize.toString());
        }
        return this.httpClient.get<IBaseResponse<IPostResponse[]>>(`${this.apiUrl}/posts`, { params });
    }

    getPostById(postId: string): Observable<IBaseResponse<IPostResponse>> {
        return this.httpClient.get<IBaseResponse<IPostResponse>>(`${this.apiUrl}/posts/${postId}`);
    }

    createPost(req: IPostCreateRequest): Observable<IBaseResponse<IPostResponse>> {
        return this.httpClient.post<IBaseResponse<IPostResponse>>(`${this.apiUrl}/posts`, req);
    }

    updatePost(postId: string, req: IPostCreateRequest): Observable<IBaseResponse<IPostResponse>> {
        return this.httpClient.patch<IBaseResponse<IPostResponse>>(`${this.apiUrl}/posts/${postId}`, req);
    }

    deletePost(postId: string): Observable<IBaseResponse<boolean>> {
        return this.httpClient.delete<IBaseResponse<boolean>>(`${this.apiUrl}/posts/${postId}`);
    }
}
