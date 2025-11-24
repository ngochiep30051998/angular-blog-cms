export interface IUser {
    _id: string;
    full_name: string;
    email: string;
    date_of_birth: string | null;
    role: string;
    created_at: string;
    updated_at: string;
    locked?: boolean;
}

export interface IUserUpdateRequest {
    full_name?: string | null;
    email?: string | null;
    date_of_birth?: string | null;
    role?: 'admin' | 'writer' | 'guest' | null;
}

export interface IUserLockRequest {
    locked: boolean;
}

export interface IChangePasswordRequest {
    old_password: string;
    new_password: string;
}

export interface IRegisterRequest {
    full_name: string;
    email: string;
    password: string;
    date_of_birth?: string | null;
    role?: 'admin' | 'writer' | 'guest' | null;
}