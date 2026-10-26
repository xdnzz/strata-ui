import * as React from 'react';
import { Slot } from '../slot/slot';
import {
  ButtonOwnProps,
  ButtonRootProps,
  ButtonSlotProps,
  ButtonState,
} from './button.types';

export interface ButtonPolymorphicComponent {
  <T extends React.ElementType = 'button'>(
    props: ButtonRootProps<T> & { ref?: React.ComponentPropsWithRef<T>['ref'] }
  ): React.ReactElement | null;
  displayName?: string;
}

const ButtonRootImpl = React.forwardRef<HTMLElement, ButtonOwnProps & React.HTMLAttributes<HTMLElement>>(
  (props, forwardedRef) => {
    const {
      variant = 'solid',
      size = 'md',
      asChild = false,
      disabled = false,
      className,
      onClick,
      onMouseEnter,
      onMouseLeave,
      onMouseDown,
      onMouseUp,
      onFocus,
      onBlur,
      ...restProps
    } = props;

    const [hovered, setHovered] = React.useState(false);
    const [active, setActive] = React.useState(false);
    const [focusVisible, setFocusVisible] = React.useState(false);

    const state: ButtonState = disabled
      ? 'disabled'
      : active
      ? 'active'
      : focusVisible
      ? 'focus-visible'
      : hovered
      ? 'hover'
      : 'rest';

    const classes = ['strata-button', className].filter(Boolean).join(' ');

    const handleClick: React.MouseEventHandler<HTMLElement> = (event) => {
      if (disabled) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      onClick?.(event);
    };

    const handleMouseEnter: React.MouseEventHandler<HTMLElement> = (event) => {
      if (!disabled) {
        setHovered(true);
      }
      onMouseEnter?.(event);
    };

    const handleMouseLeave: React.MouseEventHandler<HTMLElement> = (event) => {
      setHovered(false);
      setActive(false);
      onMouseLeave?.(event);
    };

    const handleMouseDown: React.MouseEventHandler<HTMLElement> = (event) => {
      if (!disabled) {
        setActive(true);
      }
      onMouseDown?.(event);
    };

    const handleMouseUp: React.MouseEventHandler<HTMLElement> = (event) => {
      setActive(false);
      onMouseUp?.(event);
    };

    const handleFocus: React.FocusEventHandler<HTMLElement> = (event) => {
      if (!disabled && event.currentTarget.matches(':focus-visible')) {
        setFocusVisible(true);
      }
      onFocus?.(event);
    };

    const handleBlur: React.FocusEventHandler<HTMLElement> = (event) => {
      setFocusVisible(false);
      setActive(false);
      onBlur?.(event);
    };

    const sharedProps = {
      'data-part': 'root',
      'data-variant': variant,
      'data-size': size,
      'data-state': state,
      'aria-disabled': disabled ? true : undefined,
      className: classes,
      onClick: handleClick,
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      onMouseDown: handleMouseDown,
      onMouseUp: handleMouseUp,
      onFocus: handleFocus,
      onBlur: handleBlur,
      ...restProps,
    };

    if (asChild) {
      return (
        <Slot
          ref={forwardedRef}
          tabIndex={disabled ? -1 : restProps.tabIndex}
          {...sharedProps}
        />
      );
    }

    return (
      <button
        ref={forwardedRef as React.ForwardedRef<HTMLButtonElement>}
        type="button"
        disabled={disabled}
        {...(sharedProps as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      />
    );
  }
);

ButtonRootImpl.displayName = 'Button.Root';

export const ButtonRoot = ButtonRootImpl as unknown as ButtonPolymorphicComponent;

export const ButtonLeading = React.forwardRef<HTMLSpanElement, ButtonSlotProps>(
  ({ className, ...props }, ref) => {
    const classes = ['strata-button__leading', className].filter(Boolean).join(' ');
    return (
      <span
        ref={ref}
        data-part="leading"
        aria-hidden="true"
        className={classes}
        {...props}
      />
    );
  }
);

ButtonLeading.displayName = 'Button.Leading';

export const ButtonLabel = React.forwardRef<HTMLSpanElement, ButtonSlotProps>(
  ({ className, ...props }, ref) => {
    const classes = ['strata-button__label', className].filter(Boolean).join(' ');
    return <span ref={ref} data-part="label" className={classes} {...props} />;
  }
);

ButtonLabel.displayName = 'Button.Label';

export const ButtonTrailing = React.forwardRef<HTMLSpanElement, ButtonSlotProps>(
  ({ className, ...props }, ref) => {
    const classes = ['strata-button__trailing', className].filter(Boolean).join(' ');
    return (
      <span
        ref={ref}
        data-part="trailing"
        aria-hidden="true"
        className={classes}
        {...props}
      />
    );
  }
);

ButtonTrailing.displayName = 'Button.Trailing';

export const Button = {
  Root: ButtonRoot,
  Leading: ButtonLeading,
  Label: ButtonLabel,
  Trailing: ButtonTrailing,
};