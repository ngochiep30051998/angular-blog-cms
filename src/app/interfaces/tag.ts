export interface ITagInput {
    id?: string | null;
    name?: string | null;
}

export interface ITagResponse {
    _id: string;
    name: string;
    slug: {
        value: string;
    } | string;
    description?: string | null;
    usage_count: number;
    created_at: string;
    updated_at: string;
}

export interface ITagCreateRequest {
    name: string;
    description?: string | null;
    slug?: string | null;
}

export interface ITagUpdateRequest {
    name?: string | null;
    description?: string | null;
    slug?: string | null;
}

