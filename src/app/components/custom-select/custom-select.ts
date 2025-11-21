import { Component, Input, Output, EventEmitter, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface SelectOption {
    id: string;
    label: string;
    level?: number;
    [key: string]: any;
}

@Component({
  selector: 'app-custom-select',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './custom-select.html',
  styleUrl: './custom-select.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: CustomSelect,
      multi: true,
    },
  ],
})
export class CustomSelect implements ControlValueAccessor {
    @Input() options: SelectOption[] = [];
    @Input() placeholder: string = 'Select an option';
    @Input() displayKey: string = 'label';
    @Input() valueKey: string = 'id';
    @Input() excludeId?: string;
    @Input() showAvatar: boolean = true;
    @Input() avatarKey?: string;

    protected readonly isOpen = signal<boolean>(false);
    protected readonly selectedOption = signal<SelectOption | null>(null);

    private onChange = (value: string | null) => {};
    private onTouched = () => {};

    protected get filteredOptions(): SelectOption[] {
        if (this.excludeId) {
            return this.options.filter((option) => option[this.valueKey] !== this.excludeId);
        }
        return this.options;
    }

    protected toggleDropdown(): void {
        this.isOpen.update((value) => !value);
    }

    protected selectOption(option: SelectOption | null): void {
        this.selectedOption.set(option);
        const value = option?.[this.valueKey] || null;
        this.onChange(value);
        this.onTouched();
        this.isOpen.set(false);
    }

    protected isSelected(optionId: string): boolean {
        return this.selectedOption()?.[this.valueKey] === optionId;
    }

    protected getDisplayLabel(option: SelectOption | null): string {
        if (!option) return this.placeholder;
        return option[this.displayKey] || '';
    }

    protected getAvatarText(option: SelectOption | null): string {
        if (!option) return '—';
        if (this.avatarKey && option[this.avatarKey]) {
            return String(option[this.avatarKey]).charAt(0).toUpperCase();
        }
        const label = this.getDisplayLabel(option);
        return label.charAt(0).toUpperCase();
    }

    @HostListener('document:click', ['$event'])
    protected onDocumentClick(event: MouseEvent): void {
        const target = event.target as HTMLElement;
        if (!target.closest('.custom-select-container')) {
            this.isOpen.set(false);
        }
    }

    // ControlValueAccessor implementation
    writeValue(value: string | null): void {
        if (value) {
            const option = this.options.find((opt) => opt[this.valueKey] === value);
            this.selectedOption.set(option || null);
        } else {
            this.selectedOption.set(null);
        }
    }

    registerOnChange(fn: (value: string | null) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        // Handle disabled state if needed
    }
}

