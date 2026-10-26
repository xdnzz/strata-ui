import * as React from 'react';

export type DialogPart = 'overlay' | 'surface' | 'title' | 'description' | 'close' | 'actions';

export interface DialogRootProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  triggerRef?: React.RefObject<HTMLElement | null>;
  children: React.ReactNode;
}

export type DialogOverlayProps = React.HTMLAttributes<HTMLDivElement>;

export interface DialogSurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

export type DialogTitleProps = React.HTMLAttributes<HTMLHeadingElement>;

export type DialogDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>;

export interface DialogCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

export type DialogActionsProps = React.HTMLAttributes<HTMLDivElement>;