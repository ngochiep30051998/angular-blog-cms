import { ICategoryResponse } from './category';
import { ITagInput, ITagResponse } from './tag';

export interface IPostCreateRequest {
    title: string;
    content: string;
    slug: string;
    excerpt?: string | null;
    tags?: ITagInput[] | null;
    category_id?: string | null;
    thumbnail?: string | null;
    banner?: string | null;
}

export interface IPostUpdateRequest {
    title?: string | null;
    content?: string | null;
    slug?: string | null;
    excerpt?: string | null;
    tags?: ITagInput[] | null;
    category_id?: string | null;
    thumbnail?: string | null;
    banner?: string | null;
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
    tags: ITagResponse[];
    category?: ICategoryResponse | null;
    views_count: number;
    likes_count: number;
    thumbnail?: string | null;
    banner?: string | null;
    created_at: string;
    updated_at: string;
    published_at?: string | null;
}

