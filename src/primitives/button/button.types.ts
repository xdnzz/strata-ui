import * as React from 'react';

export type ButtonVariant = 'solid' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type ButtonState = 'rest' | 'hover' | 'active' | 'focus-visible' | 'disabled';
export type ButtonPart = 'root' | 'leading' | 'label' | 'trailing';

export interface ButtonOwnProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
  disabled?: boolean;
}

export type ButtonRootProps<T extends React.ElementType = 'button'> = ButtonOwnProps &
  Omit<React.ComponentPropsWithoutRef<T>, keyof ButtonOwnProps>;

export type ButtonSlotProps = React.HTMLAttributes<HTMLSpanElement>;