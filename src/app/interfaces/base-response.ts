export interface IBaseResponse<T> {
    success: boolean;
    message: string | null;
    data: T;
    total: number | null;
    page: number | null;
    page_size: number | null;
}
