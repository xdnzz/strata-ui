import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it } from 'vitest';
import '../../tokens/tokens.css';
import { Badge } from './badge';
import './badge.css';

describe('Badge', () => {
  it('uses the visible label as the accessible name', () => {
    render(
      <Badge.Root variant="success" size="sm">
        <Badge.Label>Ready</Badge.Label>
      </Badge.Root>,
    );

    const badge = screen.getByText('Ready').closest('[data-part="root"]');
    expect(badge).not.toBeNull();
    expect(badge).toHaveAttribute('data-variant', 'success');
    expect(badge).toHaveAttribute('data-size', 'sm');
    expect(badge).not.toHaveAttribute('tabindex');
    expect(screen.getByText('Ready')).toHaveAttribute('data-part', 'label');
  });

  it('is skipped by the keyboard', async () => {
    const user = userEvent.setup();
    render(
      <>
        <button type="button">Before</button>
        <Badge.Root>
          <Badge.Label>Neutral</Badge.Label>
        </Badge.Root>
        <button type="button">After</button>
      </>,
    );

    await user.tab();
    expect(screen.getByRole('button', { name: 'Before' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'After' })).toHaveFocus();
    expect(document.activeElement).not.toHaveTextContent('Neutral');
  });

  it('merges variant onto an asChild element', () => {
    render(
      <Badge.Root asChild variant="danger" size="md">
        <span>Failed</span>
      </Badge.Root>,
    );

    const badge = screen.getByText('Failed');
    expect(badge).toHaveAttribute('data-part', 'root');
    expect(badge).toHaveAttribute('data-variant', 'danger');
    expect(badge).toHaveClass('strata-badge');
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <Badge.Root variant="warning">
        <Badge.Label>Contrast review</Badge.Label>
      </Badge.Root>,
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
