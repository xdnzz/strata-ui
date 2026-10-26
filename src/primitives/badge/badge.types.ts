import * as React from 'react';

export type BadgeVariant = 'neutral' | 'accent' | 'success' | 'warning' | 'danger';
export type BadgeSize = 'sm' | 'md';
export type BadgePart = 'root' | 'label';

export interface BadgeRootProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  asChild?: boolean;
}

export type BadgeLabelProps = React.HTMLAttributes<HTMLSpanElement>;