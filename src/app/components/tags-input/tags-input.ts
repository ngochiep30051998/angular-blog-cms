import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';

@Component({
    selector: 'app-tags-input',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './tags-input.html',
    styleUrl: './tags-input.scss',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => TagsInput),
            multi: true,
        },
    ],
})
export class TagsInput implements ControlValueAccessor {
    @Input() placeholder: string = 'Add tags (press Enter)';
    @Input() existingTags: string[] = [];

    protected tags: string[] = [];
    protected inputValue: string = '';

    private onChange = (value: string[]) => {};
    private onTouched = () => {};

    protected addTag(tag: string): void {
        const trimmedTag = tag.trim();
        if (trimmedTag && !this.tags.includes(trimmedTag)) {
            this.tags.push(trimmedTag);
            this.onChange(this.tags);
            this.onTouched();
        }
        this.inputValue = '';
    }

    protected removeTag(tag: string): void {
        this.tags = this.tags.filter((t) => t !== tag);
        this.onChange(this.tags);
        this.onTouched();
    }

    protected onKeyDown(event: KeyboardEvent): void {
        if (event.key === 'Enter') {
            event.preventDefault();
            if (this.inputValue.trim()) {
                this.addTag(this.inputValue);
            }
        } else if (event.key === 'Backspace' && !this.inputValue && this.tags.length > 0) {
            this.removeTag(this.tags[this.tags.length - 1]);
        }
    }

    protected selectExistingTag(tag: string): void {
        if (!this.tags.includes(tag)) {
            this.addTag(tag);
        }
    }

    // ControlValueAccessor implementation
    writeValue(value: string[] | null | undefined): void {
        this.tags = value ? [...value] : [];
    }

    registerOnChange(fn: (value: string[]) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        // Handle disabled state if needed
    }
}

