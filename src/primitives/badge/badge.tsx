import * as React from 'react';
import { Slot } from '../slot/slot';
import { BadgeLabelProps, BadgeRootProps } from './badge.types';

export const BadgeRoot = React.forwardRef<HTMLSpanElement, BadgeRootProps>(
  ({ variant = 'neutral', size = 'md', asChild = false, className, ...props }, ref) => {
    const classes = ['strata-badge', className].filter(Boolean).join(' ');
    const Component = asChild ? Slot : 'span';

    return (
      <Component
        ref={ref}
        data-part="root"
        data-variant={variant}
        data-size={size}
        className={classes}
        {...props}
      />
    );
  }
);

BadgeRoot.displayName = 'Badge.Root';

export const BadgeLabel = React.forwardRef<HTMLSpanElement, BadgeLabelProps>(
  ({ className, ...props }, ref) => {
    const classes = ['strata-badge__label', className].filter(Boolean).join(' ');
    return <span ref={ref} data-part="label" className={classes} {...props} />;
  }
);

BadgeLabel.displayName = 'Badge.Label';

export const Badge = {
  Root: BadgeRoot,
  Label: BadgeLabel,
};