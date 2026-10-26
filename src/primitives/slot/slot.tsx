import * as React from 'react';

export interface SlotProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
}

type MergeableProps = Record<string, unknown> & {
  className?: string;
  style?: React.CSSProperties;
};

function mergeSlotProps(slotProps: MergeableProps, childProps: MergeableProps): MergeableProps {
  const merged: MergeableProps = { ...slotProps, ...childProps };

  for (const propName of Object.keys(childProps)) {
    const slotValue = slotProps[propName];
    const childValue = childProps[propName];

    if (
      /^on[A-Z]/.test(propName) &&
      typeof slotValue === 'function' &&
      typeof childValue === 'function'
    ) {
      merged[propName] = (...args: unknown[]) => {
        (childValue as (...a: unknown[]) => void)(...args);
        (slotValue as (...a: unknown[]) => void)(...args);
      };
    }
  }

  if (slotProps.style || childProps.style) {
    merged.style = { ...slotProps.style, ...childProps.style };
  }

  if (slotProps.className || childProps.className) {
    merged.className = [slotProps.className, childProps.className].filter(Boolean).join(' ');
  }

  return merged;
}

export const Slot = React.forwardRef<HTMLElement, SlotProps>(
  (props: SlotProps, forwardedRef: React.ForwardedRef<HTMLElement>) => {
    const { children, ...slotProps } = props;

    if (!React.isValidElement<MergeableProps>(children)) {
      return null;
    }

    const mergedProps = mergeSlotProps(slotProps as MergeableProps, children.props);
    mergedProps.ref = forwardedRef;

    return React.cloneElement(children, mergedProps);
  },
);

Slot.displayName = 'Slot';