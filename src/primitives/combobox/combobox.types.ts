import * as React from 'react';

export type ComboboxState = 'rest' | 'hover' | 'focus-visible' | 'open' | 'disabled' | 'invalid';
export type ComboboxPart = 'root' | 'input' | 'listbox';

export type ComboboxOptionState = 'rest' | 'hover' | 'selected' | 'disabled';
export type ComboboxOptionPart = 'root' | 'label';

export interface ComboboxOptionRecord {
  value: string;
  label: string;
  id: string;
  disabled: boolean;
}

export interface ComboboxRootProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  invalid?: boolean;
  placeholder?: string;
}

export interface ComboboxInputProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

export type ComboboxListboxProps = React.HTMLAttributes<HTMLUListElement>;

export interface ComboboxOptionProps extends React.LiHTMLAttributes<HTMLLIElement> {
  value: string;
  disabled?: boolean;
  textValue?: string;
}

export type ComboboxOptionLabelProps = React.HTMLAttributes<HTMLSpanElement>;