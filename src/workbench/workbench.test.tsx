import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it } from 'vitest';
import { COLOR_PRIMITIVES_DARK, COLOR_PRIMITIVES_LIGHT } from '../tokens/tokens';
import { WorkbenchShell } from './workbench';

function tokenValue(name: string): string {
  const region = screen.getByRole('region', { name: 'workbench/tokens' });
  const term = within(region).getByText(name);
  const value = term.nextElementSibling;
  return value?.textContent ?? '';
}

describe('WorkbenchShell', () => {
  it('selects a component from workbench/nav and renders it in workbench/stage', async () => {
    const user = userEvent.setup();
    render(<WorkbenchShell />);

    expect(screen.getByRole('region', { name: 'workbench/shell' })).toHaveAttribute(
      'data-frame',
      'workbench/shell',
    );
    expect(screen.getByRole('navigation', { name: 'workbench/nav' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Button' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('region', { name: 'workbench/stage' })).toHaveTextContent(
      'Stage: button',
    );
    expect(screen.getByRole('button', { name: 'Confirm Action' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Combobox' }));

    expect(screen.getByRole('button', { name: 'Combobox' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: 'Button' })).not.toHaveAttribute('aria-current');
    expect(screen.getByRole('region', { name: 'workbench/stage' })).toHaveTextContent(
      'Stage: combobox',
    );
    expect(screen.getByRole('combobox', { name: 'Architecture Specification' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Confirm Action' })).not.toBeInTheDocument();
  });

  it('updates the stage when workbench/props change', async () => {
    const user = userEvent.setup();
    render(<WorkbenchShell />);

    await user.selectOptions(screen.getByRole('combobox', { name: 'variant' }), 'danger');
    await user.selectOptions(screen.getByRole('combobox', { name: 'size' }), 'lg');
    expect(screen.getByRole('button', { name: 'Confirm Action' })).toHaveAttribute(
      'data-variant',
      'danger',
    );
    expect(screen.getByRole('button', { name: 'Confirm Action' })).toHaveAttribute('data-size', 'lg');

    await user.click(screen.getByRole('checkbox', { name: 'disabled' }));
    expect(screen.getByRole('button', { name: 'Confirm Action' })).toBeDisabled();

    await user.click(screen.getByRole('checkbox', { name: 'asChild' }));
    const link = screen.getByRole('link', { name: 'Confirm Action Link' });
    expect(link).toHaveAttribute('data-variant', 'danger');
    expect(link).toHaveAttribute('href', '#workbench-stage');
  });

  it('resolves workbench/tokens for light and dark themes', async () => {
    const user = userEvent.setup();
    render(<WorkbenchShell />);

    const tokens = screen.getByRole('region', { name: 'workbench/tokens' });
    expect(tokens).toHaveTextContent('--button-bg-solid');
    expect(tokenValue('--button-bg-solid')).toBe(COLOR_PRIMITIVES_LIGHT['--color-bg-inverse']);
    expect(tokenValue('--button-bg-ghost')).toBe('#00000000');
    expect(screen.getByRole('button', { name: 'Light' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('Light Mode')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Dark' }));

    expect(screen.getByRole('button', { name: 'Dark' })).toHaveAttribute('aria-pressed', 'true');
    expect(document.querySelector('[data-theme="dark"]')).toBeInTheDocument();
    expect(screen.getByText('Dark Mode')).toBeInTheDocument();
    expect(tokenValue('--button-bg-solid')).toBe(COLOR_PRIMITIVES_DARK['--color-bg-inverse']);
    expect(tokenValue('--button-fg-solid')).toBe(COLOR_PRIMITIVES_DARK['--color-fg-on-inverse']);
  });

  it('shows the keyboard map for the selected component in workbench/a11y', async () => {
    const user = userEvent.setup();
    render(<WorkbenchShell />);

    const a11y = screen.getByRole('region', { name: 'workbench/a11y' });
    expect(a11y).toHaveTextContent('Tab');
    expect(a11y).toHaveTextContent('Moves focus in and out of the button.');
    expect(a11y).toHaveTextContent(
      'Activates native button. When asChild renders a link, Enter follows the link and Space is not captured.',
    );
    expect(a11y).toHaveTextContent(':focus-visible');
    expect(a11y).toHaveTextContent('--color-focus-ring');

    await user.click(screen.getByRole('button', { name: 'Badge' }));

    expect(a11y).toHaveTextContent('None');
    expect(a11y).toHaveTextContent('Not focusable. No keys captured.');
    expect(a11y).not.toHaveTextContent('Moves focus in and out of the button.');
    expect(screen.getByRole('region', { name: 'workbench/stage' })).toHaveTextContent(
      'WCAG AAA Verified',
    );
  });

  it('restores focus to the dialog trigger on Escape', async () => {
    const user = userEvent.setup();
    render(<WorkbenchShell defaultComponent="dialog" />);

    const trigger = screen.getByRole('button', { name: 'Open Modal Dialog' });
    await user.click(trigger);

    const dialog = screen.getByRole('dialog', { name: 'Confirm Token Publication' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAccessibleDescription(
      'Publishing updates canonical CSS variables and synchronizes the design contract across all primitives.',
    );
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();
    });

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await waitFor(() => {
      expect(trigger).toHaveFocus();
    });
    expect(screen.getByRole('region', { name: 'workbench/a11y' })).toHaveTextContent(
      'Closes the dialog and restores focus to the trigger button.',
    );
  });

  it('has no axe violations', async () => {
    const { container } = render(<WorkbenchShell />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
