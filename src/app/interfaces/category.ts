export interface ICategoryCreateRequest {
    name: string;
    description?: string | null;
    parent_id?: string | null;
    slug?: string | null;
}

export interface ICategoryResponse {
    _id: string;
    name: string;
    description?: string | null;
    slug?: string
    parent_id?: string | null;
    path: string;
    created_at: string;
    updated_at: string;
    published_at?: string | null;
    children: ICategoryResponse[];
}

