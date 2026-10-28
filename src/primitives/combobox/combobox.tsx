import * as React from 'react';
import { Slot } from '../slot/slot';
import {
  ComboboxInputProps,
  ComboboxListboxProps,
  ComboboxOptionLabelProps,
  ComboboxOptionProps,
  ComboboxOptionRecord,
  ComboboxOptionState,
  ComboboxRootProps,
  ComboboxState,
} from './combobox.types';

interface ComboboxContextValue {
  listboxId: string;
  open: boolean;
  setOpen: (nextOpen: boolean) => void;
  selectedValue: string | undefined;
  selectValue: (nextValue: string) => void;
  activeValue: string | undefined;
  setActiveValue: (nextValue: string | undefined) => void;
  disabled: boolean;
  invalid: boolean;
  placeholder: string;
  optionsRef: React.MutableRefObject<ComboboxOptionRecord[]>;
  registerOption: (record: ComboboxOptionRecord) => () => void;
  inputRef: React.RefObject<HTMLElement | null>;
}

const ComboboxContext = React.createContext<ComboboxContextValue | null>(null);

function useComboboxContext(): ComboboxContextValue {
  const ctx = React.useContext(ComboboxContext);
  if (!ctx) {
    throw new Error('Combobox parts must be rendered within Combobox.Root');
  }
  return ctx;
}

export const ComboboxRoot = React.forwardRef<HTMLDivElement, ComboboxRootProps>(
  (props, forwardedRef) => {
    const {
      value: controlledValue,
      defaultValue,
      onValueChange,
      open: controlledOpen,
      defaultOpen = false,
      onOpenChange,
      disabled = false,
      invalid = false,
      placeholder = 'Select an option',
      className,
      children,
      ...restProps
    } = props;

    const listboxId = React.useId();
    const inputRef = React.useRef<HTMLElement | null>(null);
    const optionsRef = React.useRef<ComboboxOptionRecord[]>([]);

    const [uncontrolledValue, setUncontrolledValue] = React.useState<string | undefined>(
      defaultValue
    );
    const [uncontrolledOpen, setUncontrolledOpen] = React.useState<boolean>(defaultOpen);
    const [activeValue, setActiveValue] = React.useState<string | undefined>(
      controlledValue ?? defaultValue
    );

    const isValueControlled = controlledValue !== undefined;
    const selectedValue = isValueControlled ? controlledValue : uncontrolledValue;

    const isOpenControlled = controlledOpen !== undefined;
    const open = disabled ? false : isOpenControlled ? controlledOpen : uncontrolledOpen;

    const setOpen = React.useCallback(
      (nextOpen: boolean) => {
        if (disabled) return;
        if (!isOpenControlled) {
          setUncontrolledOpen(nextOpen);
        }
        onOpenChange?.(nextOpen);
      },
      [disabled, isOpenControlled, onOpenChange]
    );

    const selectValue = React.useCallback(
      (nextValue: string) => {
        if (disabled) return;
        if (!isValueControlled) {
          setUncontrolledValue(nextValue);
        }
        onValueChange?.(nextValue);
        setOpen(false);
        inputRef.current?.focus();
      },
      [disabled, isValueControlled, onValueChange, setOpen]
    );

    const registerOption = React.useCallback((record: ComboboxOptionRecord) => {
      optionsRef.current = [
        ...optionsRef.current.filter((item) => item.value !== record.value),
        record,
      ];
      return () => {
        optionsRef.current = optionsRef.current.filter((item) => item.value !== record.value);
      };
    }, []);

    const rootState: ComboboxState = disabled
      ? 'disabled'
      : invalid
      ? 'invalid'
      : open
      ? 'open'
      : 'rest';

    const classes = ['strata-combobox', className].filter(Boolean).join(' ');

    const contextValue = React.useMemo<ComboboxContextValue>(
      () => ({
        listboxId,
        open,
        setOpen,
        selectedValue,
        selectValue,
        activeValue,
        setActiveValue,
        disabled,
        invalid,
        placeholder,
        optionsRef,
        registerOption,
        inputRef,
      }),
      [
        listboxId,
        open,
        setOpen,
        selectedValue,
        selectValue,
        activeValue,
        disabled,
        invalid,
        placeholder,
        registerOption,
      ]
    );

    return (
      <ComboboxContext.Provider value={contextValue}>
        <div
          ref={forwardedRef}
          data-part="root"
          data-state={rootState}
          className={classes}
          {...restProps}
        >
          {children}
        </div>
      </ComboboxContext.Provider>
    );
  }
);

ComboboxRoot.displayName = 'Combobox.Root';

export const ComboboxInput = React.forwardRef<HTMLDivElement, ComboboxInputProps>(
  (props, forwardedRef) => {
    const {
      asChild = false,
      className,
      children,
      onKeyDown,
      onClick,
      onMouseEnter,
      onMouseLeave,
      onFocus,
      onBlur,
      ...restProps
    } = props;

    const {
      listboxId,
      open,
      setOpen,
      selectedValue,
      selectValue,
      activeValue,
      setActiveValue,
      disabled,
      invalid,
      placeholder,
      optionsRef,
      inputRef,
    } = useComboboxContext();

    const [hovered, setHovered] = React.useState(false);
    const [focusVisible, setFocusVisible] = React.useState(false);

    const setMergedRef = React.useCallback(
      (node: HTMLDivElement | null) => {
        inputRef.current = node;
        if (typeof forwardedRef === 'function') {
          forwardedRef(node);
        } else if (forwardedRef) {
          forwardedRef.current = node;
        }
      },
      [forwardedRef, inputRef]
    );

    const getEnabledOptions = (): ComboboxOptionRecord[] =>
      optionsRef.current.filter((option) => !option.disabled);

    const moveActiveByOffset = (offset: number) => {
      const enabled = getEnabledOptions();
      if (enabled.length === 0) return;

      const currentIndex = enabled.findIndex((item) => item.value === activeValue);
      if (currentIndex === -1) {
        const selectedIndex = enabled.findIndex((item) => item.value === selectedValue);
        const fallbackIndex = selectedIndex !== -1 ? selectedIndex : offset > 0 ? 0 : enabled.length - 1;
        setActiveValue(enabled[fallbackIndex]?.value);
        return;
      }

      const nextIndex = Math.max(0, Math.min(enabled.length - 1, currentIndex + offset));
      setActiveValue(enabled[nextIndex]?.value);
    };

    const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (event) => {
      if (disabled) return;

      const enabled = getEnabledOptions();

      if (event.key === 'ArrowDown' && event.altKey) {
        event.preventDefault();
        if (!open) {
          setOpen(true);
          const initial =
            enabled.find((item) => item.value === selectedValue) ?? enabled[0];
          setActiveValue(initial?.value);
        } else {
          moveActiveByOffset(1);
        }
        return;
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        if (!open) {
          setOpen(true);
          const initial =
            enabled.find((item) => item.value === selectedValue) ?? enabled[0];
          setActiveValue(initial?.value);
        } else {
          moveActiveByOffset(1);
        }
        return;
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        if (!open) {
          setOpen(true);
          const initial =
            enabled.find((item) => item.value === selectedValue) ??
            enabled[enabled.length - 1];
          setActiveValue(initial?.value);
        } else {
          moveActiveByOffset(-1);
        }
        return;
      }

      if (event.key === 'Home' && open) {
        event.preventDefault();
        if (enabled.length > 0) {
          setActiveValue(enabled[0].value);
        }
        return;
      }

      if (event.key === 'End' && open) {
        event.preventDefault();
        if (enabled.length > 0) {
          setActiveValue(enabled[enabled.length - 1].value);
        }
        return;
      }

      if (event.key === 'Enter' && open) {
        event.preventDefault();
        if (activeValue !== undefined) {
          selectValue(activeValue);
        }
        return;
      }

      if (event.key === 'Escape' && open) {
        event.preventDefault();
        setOpen(false);
        inputRef.current?.focus();
        return;
      }

      if (event.key === 'Tab' && open) {
        setOpen(false);
      }

      onKeyDown?.(event);
    };

    const handleClick: React.MouseEventHandler<HTMLDivElement> = (event) => {
      if (disabled) return;
      const nextOpen = !open;
      setOpen(nextOpen);
      if (nextOpen) {
        const enabled = getEnabledOptions();
        const initial =
          enabled.find((item) => item.value === selectedValue) ?? enabled[0];
        setActiveValue(initial?.value);
      }
      onClick?.(event);
    };

    const activeRecord = optionsRef.current.find((item) => item.value === activeValue);
    const selectedRecord = optionsRef.current.find((item) => item.value === selectedValue);
    const visibleValue = selectedRecord ? selectedRecord.label : placeholder;

    const state: ComboboxState = disabled
      ? 'disabled'
      : invalid
      ? 'invalid'
      : open
      ? 'open'
      : focusVisible
      ? 'focus-visible'
      : hovered
      ? 'hover'
      : 'rest';

    const classes = ['strata-combobox__input', className].filter(Boolean).join(' ');

    const Component = asChild ? Slot : 'div';

    return (
      <Component
        ref={setMergedRef}
        role="combobox"
        tabIndex={disabled ? -1 : 0}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-activedescendant={open && activeRecord ? activeRecord.id : undefined}
        aria-disabled={disabled ? true : undefined}
        aria-invalid={invalid ? true : undefined}
        aria-label={children == null ? visibleValue : undefined}
        data-part="input"
        data-state={state}
        data-placeholder={selectedRecord ? undefined : ''}
        className={classes}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
          if (!disabled) setHovered(true);
          onMouseEnter?.(e);
        }}
        onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
          setHovered(false);
          onMouseLeave?.(e);
        }}
        onFocus={(e: React.FocusEvent<HTMLDivElement>) => {
          if (!disabled && e.currentTarget.matches(':focus-visible')) {
            setFocusVisible(true);
          }
          onFocus?.(e);
        }}
        onBlur={(e: React.FocusEvent<HTMLDivElement>) => {
          setFocusVisible(false);
          onBlur?.(e);
        }}
        {...restProps}
      >
        {children ?? visibleValue}
      </Component>
    );
  }
);

ComboboxInput.displayName = 'Combobox.Input';

export const ComboboxListbox = React.forwardRef<HTMLUListElement, ComboboxListboxProps>(
  ({ className, children, ...props }, forwardedRef) => {
    const { listboxId, open, disabled, invalid } = useComboboxContext();

    const state: ComboboxState = disabled
      ? 'disabled'
      : invalid
      ? 'invalid'
      : open
      ? 'open'
      : 'rest';

    const classes = ['strata-combobox__listbox', className].filter(Boolean).join(' ');

    return (
      <ul
        ref={forwardedRef}
        id={listboxId}
        role="listbox"
        tabIndex={-1}
        hidden={!open}
        data-part="listbox"
        data-state={state}
        className={classes}
        {...props}
      >
        {children}
      </ul>
    );
  }
);

ComboboxListbox.displayName = 'Combobox.Listbox';

export const ComboboxOption = React.forwardRef<HTMLLIElement, ComboboxOptionProps>(
  (props, forwardedRef) => {
    const {
      value,
      disabled: optionDisabled = false,
      textValue,
      id: providedId,
      className,
      children,
      onClick,
      onMouseEnter,
      onMouseLeave,
      ...restProps
    } = props;

    const generatedId = React.useId();
    const optionId = providedId ?? generatedId;

    const {
      selectedValue,
      selectValue,
      activeValue,
      setActiveValue,
      disabled: rootDisabled,
      registerOption,
    } = useComboboxContext();

    const [hovered, setHovered] = React.useState(false);

    const isDisabled = rootDisabled || optionDisabled;
    const isSelected = selectedValue === value;
    const isActive = activeValue === value;

    const resolvedLabel =
      textValue ?? (typeof children === 'string' ? children : value);

    React.useEffect(() => {
      return registerOption({
        value,
        label: resolvedLabel,
        id: optionId,
        disabled: isDisabled,
      });
    }, [registerOption, value, resolvedLabel, optionId, isDisabled]);

    const optionState: ComboboxOptionState = isDisabled
      ? 'disabled'
      : isSelected
      ? 'selected'
      : hovered || isActive
      ? 'hover'
      : 'rest';

    const classes = ['strata-combobox__option', className].filter(Boolean).join(' ');

    const handleClick: React.MouseEventHandler<HTMLLIElement> = (event) => {
      if (isDisabled) {
        event.preventDefault();
        return;
      }
      selectValue(value);
      onClick?.(event);
    };

    return (
      <li
        ref={forwardedRef}
        id={optionId}
        role="option"
        aria-selected={isSelected}
        aria-disabled={isDisabled ? true : undefined}
        data-part="root"
        data-state={optionState}
        data-highlighted={isActive ? '' : undefined}
        className={classes}
        onClick={handleClick}
        onMouseEnter={(e) => {
          if (!isDisabled) {
            setHovered(true);
            setActiveValue(value);
          }
          onMouseEnter?.(e);
        }}
        onMouseLeave={(e) => {
          setHovered(false);
          onMouseLeave?.(e);
        }}
        {...restProps}
      >
        {children}
      </li>
    );
  }
);

ComboboxOption.displayName = 'Combobox.Option';

export const ComboboxOptionLabel = React.forwardRef<HTMLSpanElement, ComboboxOptionLabelProps>(
  ({ className, ...props }, ref) => {
    const classes = ['strata-combobox__option-label', className].filter(Boolean).join(' ');
    return <span ref={ref} data-part="label" className={classes} {...props} />;
  }
);

ComboboxOptionLabel.displayName = 'Combobox.OptionLabel';

export const Combobox = {
  Root: ComboboxRoot,
  Input: ComboboxInput,
  Listbox: ComboboxListbox,
  Option: ComboboxOption,
  OptionLabel: ComboboxOptionLabel,
};