import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';
import '../../tokens/tokens.css';
import { expectDisabledOpacity, expectVisibleFocusRing } from '../../test/expect-focus-ring';
import { Button } from './button';
import './button.css';

describe('Button', () => {
  it('uses the visible label as the accessible name and hides decorative icons', () => {
    render(
      <Button.Root>
        <Button.Leading>plus</Button.Leading>
        <Button.Label>Save changes</Button.Label>
        <Button.Trailing>chevron</Button.Trailing>
      </Button.Root>,
    );

    expect(screen.getByRole('button', { name: 'Save changes' })).toBeInTheDocument();
    expect(screen.getByText('plus')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByText('chevron')).toHaveAttribute('aria-hidden', 'true');
  });

  it('exposes variant, size, and rest state', () => {
    render(
      <Button.Root variant="outline" size="lg">
        <Button.Label>Export</Button.Label>
      </Button.Root>,
    );

    const button = screen.getByRole('button', { name: 'Export' });
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveAttribute('data-part', 'root');
    expect(button).toHaveAttribute('data-variant', 'outline');
    expect(button).toHaveAttribute('data-size', 'lg');
    expect(button).toHaveAttribute('data-state', 'rest');
  });

  it('activates with Enter and Space', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button.Root onClick={onClick}>
        <Button.Label>Save</Button.Label>
      </Button.Root>,
    );

    const button = screen.getByRole('button', { name: 'Save' });
    button.focus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it('does not submit a form', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <Button.Root>
          <Button.Label>Save</Button.Label>
        </Button.Root>
      </form>,
    );

    await user.click(screen.getByRole('button', { name: 'Save' }));
    await user.keyboard('{Enter}');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows the focus ring after keyboard focus', async () => {
    const user = userEvent.setup();
    render(
      <Button.Root variant="solid" size="md">
        <Button.Label>Save</Button.Label>
      </Button.Root>,
    );

    await user.tab();
    const button = screen.getByRole('button', { name: 'Save' });
    expect(button).toHaveAttribute('data-state', 'focus-visible');
    expectVisibleFocusRing(button);
  });

  it('moves through hover and keeps disabled text on the disabled tokens', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button.Root disabled onClick={onClick}>
        <Button.Label>Save</Button.Label>
      </Button.Root>,
    );

    const button = screen.getByRole('button', { name: 'Save' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).toHaveAttribute('data-state', 'disabled');
    await user.hover(button);
    expect(button).toHaveAttribute('data-state', 'disabled');
    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
    expectDisabledOpacity(button);
  });

  it('follows an asChild link with Enter and does not capture Space', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <>
        <button type="button">Before</button>
        <Button.Root asChild>
          <a href="/tokens" onClick={onClick}>
            Token reference
          </a>
        </Button.Root>
      </>,
    );

    const link = screen.getByRole('link', { name: 'Token reference' });
    expect(link).toHaveAttribute('data-variant', 'solid');
    expect(link).toHaveAttribute('href', '/tokens');
    await user.tab();
    await user.tab();
    expect(link).toHaveFocus();
    await user.keyboard(' ');
    expect(onClick).not.toHaveBeenCalled();
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('removes a disabled asChild control from the tab order', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <>
        <button type="button">Before</button>
        <Button.Root asChild disabled onClick={onClick}>
          <a href="/tokens">Token reference</a>
        </Button.Root>
        <button type="button">After</button>
      </>,
    );

    const link = screen.getByRole('link', { name: 'Token reference' });
    expect(link).toHaveAttribute('aria-disabled', 'true');
    expect(link).toHaveAttribute('tabindex', '-1');
    await user.tab();
    await user.tab();
    expect(screen.getByRole('button', { name: 'After' })).toHaveFocus();
    await user.click(link);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <Button.Root variant="danger" size="sm">
        <Button.Leading>plus</Button.Leading>
        <Button.Label>Delete</Button.Label>
      </Button.Root>,
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
