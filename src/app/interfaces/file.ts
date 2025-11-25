export interface IFileResponse {
    _id: string;
    name?: string | null;
    cloudinary_url?: string | null;
    mime_type: string;
    alt?: string | null;
    uploaded_by?: string | null;
}

