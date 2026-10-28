import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRef, useState } from 'react';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';
import '../../tokens/tokens.css';
import { expectVisibleFocusRing } from '../../test/expect-focus-ring';
import { Button } from '../button/button';
import '../button/button.css';
import { Dialog } from './dialog';
import './dialog.css';

function DeleteDialog({
  defaultOpen = false,
  onOpenChange,
}: {
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(defaultOpen);

  return (
    <>
      <button ref={triggerRef} type="button" onClick={() => setOpen(true)}>
        Open dialog
      </button>
      <Dialog.Root
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          onOpenChange?.(nextOpen);
        }}
        triggerRef={triggerRef}
      >
        <Dialog.Overlay />
        <Dialog.Surface>
          <Dialog.Title>Delete this project</Dialog.Title>
          <Dialog.Description>The project and its tokens will be removed.</Dialog.Description>
          <Dialog.Actions>
            <Dialog.Close>Cancel</Dialog.Close>
            <Button.Root variant="danger" onClick={() => setOpen(false)}>
              <Button.Label>Delete</Button.Label>
            </Button.Root>
          </Dialog.Actions>
        </Dialog.Surface>
      </Dialog.Root>
    </>
  );
}

describe('Dialog', () => {
  it('requires its parts to render inside the root', () => {
    expect(() => render(<Dialog.Title>Title</Dialog.Title>)).toThrow(
      'Dialog parts must be rendered within Dialog.Root',
    );
  });

  it('names the dialog from the visible title and description', async () => {
    const user = userEvent.setup();
    render(<DeleteDialog />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Open dialog' }));

    const dialog = screen.getByRole('dialog', { name: 'Delete this project' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAccessibleDescription('The project and its tokens will be removed.');
    expect(screen.getByRole('heading', { name: 'Delete this project' })).toBeVisible();
    expect(screen.getByText('The project and its tokens will be removed.')).toBeVisible();
    expect(dialog).toHaveAttribute('data-part', 'surface');
  });

  it('moves focus inside on open and returns it to the trigger on Escape', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<DeleteDialog onOpenChange={onOpenChange} />);

    const trigger = screen.getByRole('button', { name: 'Open dialog' });
    await user.click(trigger);
    const cancel = screen.getByRole('button', { name: 'Cancel' });
    await waitFor(() => {
      expect(cancel).toHaveFocus();
    });

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await waitFor(() => {
      expect(trigger).toHaveFocus();
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('cycles Tab and Shift+Tab inside the dialog and shows the focus ring', async () => {
    const user = userEvent.setup();
    render(<DeleteDialog />);

    await user.click(screen.getByRole('button', { name: 'Open dialog' }));
    const cancel = screen.getByRole('button', { name: 'Cancel' });
    const deleteButton = screen.getByRole('button', { name: 'Delete' });
    await waitFor(() => {
      expect(cancel).toHaveFocus();
    });

    await user.tab();
    expect(deleteButton).toHaveFocus();
    expect(deleteButton).toHaveAttribute('data-state', 'focus-visible');
    expectVisibleFocusRing(deleteButton);

    await user.tab();
    expect(cancel).toHaveFocus();

    await user.tab({ shift: true });
    expect(deleteButton).toHaveFocus();
  });

  it('closes from the close button', async () => {
    const user = userEvent.setup();
    render(<DeleteDialog />);

    await user.click(screen.getByRole('button', { name: 'Open dialog' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('has no axe violations while open', async () => {
    const user = userEvent.setup();
    const { container } = render(<DeleteDialog />);
    await user.click(screen.getByRole('button', { name: 'Open dialog' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });
});
