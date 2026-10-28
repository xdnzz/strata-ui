import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';
import '../../tokens/tokens.css';
import { expectVisibleFocusRing } from '../../test/expect-focus-ring';
import { Combobox } from './combobox';
import './combobox.css';

function CityCombobox({
  disabled = false,
  invalid = false,
  onValueChange,
}: {
  disabled?: boolean;
  invalid?: boolean;
  onValueChange?: (value: string) => void;
}) {
  return (
    <Combobox.Root disabled={disabled} invalid={invalid} onValueChange={onValueChange}>
      <Combobox.Input />
      <Combobox.Listbox>
        <Combobox.Option value="recife" textValue="Recife">
          <Combobox.OptionLabel>Recife</Combobox.OptionLabel>
        </Combobox.Option>
        <Combobox.Option value="olinda" textValue="Olinda" disabled>
          <Combobox.OptionLabel>Olinda</Combobox.OptionLabel>
        </Combobox.Option>
        <Combobox.Option value="salvador" textValue="Salvador">
          <Combobox.OptionLabel>Salvador</Combobox.OptionLabel>
        </Combobox.Option>
      </Combobox.Listbox>
    </Combobox.Root>
  );
}

describe('Combobox', () => {
  it('names the closed field with the visible placeholder', () => {
    render(<CityCombobox />);

    const combobox = screen.getByRole('combobox', { name: 'Select an option' });
    expect(combobox).toHaveAttribute('aria-haspopup', 'listbox');
    expect(combobox).toHaveAttribute('aria-expanded', 'false');
    expect(combobox).toHaveAttribute('data-part', 'input');
    expect(combobox).toHaveAttribute('data-state', 'rest');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(() => render(<Combobox.Option value="orphan">Orphan</Combobox.Option>)).toThrow(
      'Combobox parts must be rendered within Combobox.Root',
    );
  });

  it('opens with ArrowDown, skips disabled options, and selects with Enter', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<CityCombobox onValueChange={onValueChange} />);

    const combobox = screen.getByRole('combobox', { name: 'Select an option' });
    combobox.focus();
    await user.keyboard('{ArrowDown}');

    const recife = screen.getByRole('option', { name: 'Recife' });
    const listbox = screen.getByRole('listbox');
    expect(combobox).toHaveAttribute('aria-expanded', 'true');
    expect(combobox).toHaveAttribute('aria-controls', listbox.id);
    expect(combobox).toHaveAttribute('aria-activedescendant', recife.id);
    expect(recife).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByRole('option', { name: 'Olinda' })).toHaveAttribute('aria-disabled', 'true');

    await user.keyboard('{ArrowDown}');
    const salvador = screen.getByRole('option', { name: 'Salvador' });
    expect(combobox).toHaveAttribute('aria-activedescendant', salvador.id);

    await user.keyboard('{Home}');
    expect(combobox).toHaveAttribute('aria-activedescendant', recife.id);
    await user.keyboard('{End}');
    expect(combobox).toHaveAttribute('aria-activedescendant', salvador.id);

    await user.keyboard('{Enter}');
    expect(onValueChange).toHaveBeenCalledWith('salvador');
    expect(combobox).toHaveAttribute('aria-expanded', 'false');
    expect(combobox).toHaveTextContent('Salvador');
    expect(combobox).toHaveFocus();
    expect(screen.getByRole('option', { name: 'Salvador', hidden: true })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('opens on the last enabled option with ArrowUp and on the selected option with Alt+ArrowDown', async () => {
    const user = userEvent.setup();
    render(<CityCombobox />);

    const combobox = screen.getByRole('combobox', { name: 'Select an option' });
    combobox.focus();
    await user.keyboard('{ArrowUp}');
    expect(combobox).toHaveAttribute(
      'aria-activedescendant',
      screen.getByRole('option', { name: 'Salvador' }).id,
    );

    await user.keyboard('{Escape}');
    expect(combobox).toHaveAttribute('aria-expanded', 'false');
    expect(combobox).toHaveFocus();
    expect(combobox).toHaveTextContent('Select an option');

    await user.keyboard('{Alt>}{ArrowDown}{/Alt}');
    expect(combobox).toHaveAttribute('aria-expanded', 'true');
    expect(combobox).toHaveAttribute(
      'aria-activedescendant',
      screen.getByRole('option', { name: 'Recife' }).id,
    );
  });

  it('closes on Tab without selecting', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <>
        <CityCombobox onValueChange={onValueChange} />
        <button type="button">After</button>
      </>,
    );

    const combobox = screen.getByRole('combobox', { name: 'Select an option' });
    combobox.focus();
    await user.keyboard('{ArrowDown}');
    await user.tab();
    expect(combobox).toHaveAttribute('aria-expanded', 'false');
    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'After' })).toHaveFocus();
  });

  it('selects an option with the pointer and shows the focus ring from the keyboard', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<CityCombobox onValueChange={onValueChange} />);

    const combobox = screen.getByRole('combobox', { name: 'Select an option' });
    await user.tab();
    expect(combobox).toHaveAttribute('data-state', 'focus-visible');
    expectVisibleFocusRing(combobox);

    await user.click(combobox);
    await user.click(screen.getByRole('option', { name: 'Recife' }));
    expect(onValueChange).toHaveBeenCalledWith('recife');
    expect(combobox).toHaveTextContent('Recife');
    expect(combobox).toHaveAttribute('aria-expanded', 'false');
  });

  it('does not open when disabled and marks an invalid field', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<CityCombobox disabled />);

    const combobox = screen.getByRole('combobox', { name: 'Select an option' });
    expect(combobox).toHaveAttribute('aria-disabled', 'true');
    expect(combobox).toHaveAttribute('tabindex', '-1');
    expect(combobox).toHaveAttribute('data-state', 'disabled');
    await user.click(combobox);
    combobox.focus();
    await user.keyboard('{ArrowDown}');
    expect(combobox).toHaveAttribute('aria-expanded', 'false');

    rerender(<CityCombobox invalid />);
    expect(screen.getByRole('combobox', { name: 'Select an option' })).toHaveAttribute(
      'aria-invalid',
      'true',
    );
  });

  it('has no axe violations when closed or open', async () => {
    const user = userEvent.setup();
    const { container } = render(<CityCombobox />);
    expect(await axe(container)).toHaveNoViolations();

    await user.click(screen.getByRole('combobox', { name: 'Select an option' }));
    expect(await axe(container)).toHaveNoViolations();
  });
});
