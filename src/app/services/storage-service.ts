import { Injectable } from '@angular/core';
import { StorageEnum } from '../enums/storage.enum';
import { IUser } from '../interfaces/user.interface';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
    private readonly storage = localStorage;
    private readonly storageKey = StorageEnum;
    getItem(key: StorageEnum): string | null {
        return this.storage.getItem(key);
    }

    setItem(key: StorageEnum, value: string | null): void {
        if (value === null) {
            this.removeItem(key);
        } else {
            this.storage.setItem(key, value);
        }
    }

    removeItem(key: StorageEnum): void {
        this.storage.removeItem(key);
    }

    clear(): void {
        this.storage.clear();
    }

    public get token(): string | null {
        return this.getItem(this.storageKey.TOKEN);
    }
    public set token(value: string | null) {
        this.setItem(this.storageKey.TOKEN, value);
    }

    public get userProfile(): IUser | null {
        const userData = this.getItem(this.storageKey.USER);
        if (userData) {
            try {
                return JSON.parse(userData) as IUser;
            } catch {
                return null;
            }
        }
        return null;
    }

    public set userProfile(value: IUser | null) {
        if (value === null) {
            this.removeItem(this.storageKey.USER);
        } else {
            this.setItem(this.storageKey.USER, JSON.stringify(value));
        }
    }
}
