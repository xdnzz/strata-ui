import * as React from 'react';
import { Slot } from '../slot/slot';
import {
  DialogActionsProps,
  DialogCloseProps,
  DialogDescriptionProps,
  DialogOverlayProps,
  DialogRootProps,
  DialogSurfaceProps,
  DialogTitleProps,
} from './dialog.types';

interface DialogContextValue {
  open: boolean;
  setOpen: (nextOpen: boolean) => void;
  titleId: string;
  descriptionId: string;
  triggerRef?: React.RefObject<HTMLElement | null>;
}

const DialogContext = React.createContext<DialogContextValue | null>(null);

function useDialogContext(): DialogContextValue {
  const ctx = React.useContext(DialogContext);
  if (!ctx) {
    throw new Error('Dialog parts must be rendered within Dialog.Root');
  }
  return ctx;
}

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export const DialogRoot: React.FC<DialogRootProps> = ({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  triggerRef,
  children,
}) => {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState<boolean>(defaultOpen);
  const titleId = React.useId();
  const descriptionId = React.useId();

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const setOpen = React.useCallback(
    (nextOpen: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(nextOpen);
      }
      onOpenChange?.(nextOpen);
    },
    [isControlled, onOpenChange]
  );

  const contextValue = React.useMemo<DialogContextValue>(
    () => ({
      open,
      setOpen,
      titleId,
      descriptionId,
      triggerRef,
    }),
    [open, setOpen, titleId, descriptionId, triggerRef]
  );

  return <DialogContext.Provider value={contextValue}>{children}</DialogContext.Provider>;
};

DialogRoot.displayName = 'Dialog.Root';

export const DialogOverlay = React.forwardRef<HTMLDivElement, DialogOverlayProps>(
  ({ className, ...props }, ref) => {
    const { open } = useDialogContext();
    if (!open) return null;

    const classes = ['strata-dialog__overlay', className].filter(Boolean).join(' ');
    return (
      <div
        ref={ref}
        data-part="overlay"
        aria-hidden="true"
        className={classes}
        {...props}
      />
    );
  }
);

DialogOverlay.displayName = 'Dialog.Overlay';

export const DialogSurface = React.forwardRef<HTMLDivElement, DialogSurfaceProps>(
  ({ asChild = false, className, onKeyDown, children, ...props }, forwardedRef) => {
    const { open, setOpen, titleId, descriptionId, triggerRef } = useDialogContext();
    const surfaceRef = React.useRef<HTMLDivElement | null>(null);
    const previouslyFocusedRef = React.useRef<HTMLElement | null>(null);

    const setMergedRef = React.useCallback(
      (node: HTMLDivElement | null) => {
        surfaceRef.current = node;
        if (typeof forwardedRef === 'function') {
          forwardedRef(node);
        } else if (forwardedRef) {
          forwardedRef.current = node;
        }
      },
      [forwardedRef]
    );

    React.useEffect(() => {
      if (!open) return;

      previouslyFocusedRef.current =
        triggerRef?.current ??
        (document.activeElement instanceof HTMLElement ? document.activeElement : null);

      const surfaceNode = surfaceRef.current;
      if (surfaceNode) {
        const focusables = Array.from(
          surfaceNode.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
        ).filter((el) => el.getAttribute('aria-disabled') !== 'true');

        if (focusables.length > 0) {
          focusables[0].focus();
        } else {
          surfaceNode.focus();
        }
      }

      const restoreTarget = previouslyFocusedRef.current;
      return () => {
        restoreTarget?.focus();
      };
    }, [open, triggerRef]);

    if (!open) return null;

    const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        setOpen(false);
        return;
      }

      if (event.key === 'Tab') {
        const surfaceNode = surfaceRef.current;
        if (!surfaceNode) return;

        const focusables = Array.from(
          surfaceNode.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
        ).filter((el) => el.getAttribute('aria-disabled') !== 'true');

        if (focusables.length === 0) {
          event.preventDefault();
          return;
        }

        const firstElement = focusables[0];
        const lastElement = focusables[focusables.length - 1];
        const activeElement = document.activeElement;

        if (event.shiftKey) {
          if (activeElement === firstElement || !surfaceNode.contains(activeElement)) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          if (activeElement === lastElement || !surfaceNode.contains(activeElement)) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }

      onKeyDown?.(event);
    };

    const classes = ['strata-dialog__surface', className].filter(Boolean).join(' ');
    const Component = asChild ? Slot : 'div';

    return (
      <Component
        ref={setMergedRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        data-part="surface"
        className={classes}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

DialogSurface.displayName = 'Dialog.Surface';

export const DialogTitle = React.forwardRef<HTMLHeadingElement, DialogTitleProps>(
  ({ className, ...props }, ref) => {
    const { titleId } = useDialogContext();
    const classes = ['strata-dialog__title', className].filter(Boolean).join(' ');
    return (
      <h2
        ref={ref}
        id={titleId}
        data-part="title"
        className={classes}
        {...props}
      />
    );
  }
);

DialogTitle.displayName = 'Dialog.Title';

export const DialogDescription = React.forwardRef<HTMLParagraphElement, DialogDescriptionProps>(
  ({ className, ...props }, ref) => {
    const { descriptionId } = useDialogContext();
    const classes = ['strata-dialog__description', className].filter(Boolean).join(' ');
    return (
      <p
        ref={ref}
        id={descriptionId}
        data-part="description"
        className={classes}
        {...props}
      />
    );
  }
);

DialogDescription.displayName = 'Dialog.Description';

export const DialogClose = React.forwardRef<HTMLButtonElement, DialogCloseProps>(
  ({ asChild = false, className, onClick, ...props }, ref) => {
    const { setOpen } = useDialogContext();
    const classes = ['strata-dialog__close', className].filter(Boolean).join(' ');

    const handleClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
      onClick?.(event);
      setOpen(false);
    };

    if (asChild) {
      return (
        <Slot
          ref={ref}
          data-part="close"
          className={classes}
          onClick={handleClick as unknown as React.MouseEventHandler<HTMLElement>}
          {...props}
        />
      );
    }

    return (
      <button
        ref={ref}
        type="button"
        data-part="close"
        className={classes}
        onClick={handleClick}
        {...props}
      />
    );
  }
);

DialogClose.displayName = 'Dialog.Close';

export const DialogActions = React.forwardRef<HTMLDivElement, DialogActionsProps>(
  ({ className, ...props }, ref) => {
    const classes = ['strata-dialog__actions', className].filter(Boolean).join(' ');
    return <div ref={ref} data-part="actions" className={classes} {...props} />;
  }
);

DialogActions.displayName = 'Dialog.Actions';

export const Dialog = {
  Root: DialogRoot,
  Overlay: DialogOverlay,
  Surface: DialogSurface,
  Title: DialogTitle,
  Description: DialogDescription,
  Close: DialogClose,
  Actions: DialogActions,
};