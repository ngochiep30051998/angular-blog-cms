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
    meta_title?: string | null;
    meta_description?: string | null;
    meta_keywords?: string[] | null;
    meta_robots?: string | null;
    og_title?: string | null;
    og_description?: string | null;
    og_image?: string | null;
    og_type?: string | null;
    twitter_card?: string | null;
    twitter_title?: string | null;
    twitter_description?: string | null;
    twitter_image?: string | null;
    canonical_url?: string | null;
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
    meta_title?: string | null;
    meta_description?: string | null;
    meta_keywords?: string[] | null;
    meta_robots?: string | null;
    og_title?: string | null;
    og_description?: string | null;
    og_image?: string | null;
    og_type?: string | null;
    twitter_card?: string | null;
    twitter_title?: string | null;
    twitter_description?: string | null;
    twitter_image?: string | null;
    canonical_url?: string | null;
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
    meta_title?: string | null;
    meta_description?: string | null;
    meta_keywords?: string[] | null;
    meta_robots?: string | null;
    og_title?: string | null;
    og_description?: string | null;
    og_image?: string | null;
    og_type?: string | null;
    twitter_card?: string | null;
    twitter_title?: string | null;
    twitter_description?: string | null;
    twitter_image?: string | null;
    canonical_url?: string | null;
    created_at: string;
    updated_at: string;
    published_at?: string | null;
}

