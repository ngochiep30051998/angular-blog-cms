import { ICategoryResponse } from './category';

export interface IPostCreateRequest {
    title: string;
    content: string;
    slug: string;
    excerpt?: string | null;
    tags?: string[] | null;
    category_id?: string | null;
}

export interface IPostResponse {
    _id: string;
    slug: {
        value: string;
    } | string;
    title: string;
    content: string;
    excerpt?: string | null;
    author_name?: string | null;
    author_email?: string | null;
    status: string;
    tags: string[];
    category?: ICategoryResponse | null;
    views_count: number;
    likes_count: number;
    created_at: string;
    updated_at: string;
    published_at?: string | null;
}

