import * as React from 'react';
import '../tokens/tokens.css';
import '../primitives/button/button.css';
import '../primitives/combobox/combobox.css';
import '../primitives/dialog/dialog.css';
import '../primitives/badge/badge.css';
import './workbench.css';

import {
  COLOR_PRIMITIVES_DARK,
  COLOR_PRIMITIVES_LIGHT,
  ColorPrimitiveTokenName,
  METRIC_PRIMITIVES,
  MetricPrimitiveTokenName,
  PrimitiveTokenName,
  SEMANTIC_TOKEN_ALIASES,
  SemanticTokenName,
  ThemeMode,
} from '../tokens/tokens';
import { Button } from '../primitives/button/button';
import { ButtonSize, ButtonVariant } from '../primitives/button/button.types';
import { Combobox } from '../primitives/combobox/combobox';
import { Dialog } from '../primitives/dialog/dialog';
import { Badge } from '../primitives/badge/badge';
import { BadgeSize, BadgeVariant } from '../primitives/badge/badge.types';
import {
  WorkbenchComponentId,
  WorkbenchKeyboardEntry,
  WorkbenchPropStateMap,
  WorkbenchShellProps,
  WorkbenchTokenEntry,
} from './workbench.types';

const COMPONENT_LIST: ReadonlyArray<{ id: WorkbenchComponentId; label: string }> = [
  { id: 'button', label: 'Button' },
  { id: 'combobox', label: 'Combobox' },
  { id: 'dialog', label: 'Dialog' },
  { id: 'badge', label: 'Badge' },
];

const BUTTON_VARIANTS: ReadonlyArray<ButtonVariant> = ['solid', 'outline', 'ghost', 'danger'];
const BUTTON_SIZES: ReadonlyArray<ButtonSize> = ['sm', 'md', 'lg'];

const BADGE_VARIANTS: ReadonlyArray<BadgeVariant> = [
  'neutral',
  'accent',
  'success',
  'warning',
  'danger',
];
const BADGE_SIZES: ReadonlyArray<BadgeSize> = ['sm', 'md'];

const COMPONENT_TOKENS: Readonly<Record<WorkbenchComponentId, ReadonlyArray<SemanticTokenName>>> = {
  button: [
    '--button-bg-solid',
    '--button-bg-solid-hover',
    '--button-fg-solid',
    '--button-bg-outline',
    '--button-bg-outline-hover',
    '--button-fg-outline',
    '--button-border-outline',
    '--button-bg-ghost',
    '--button-bg-ghost-hover',
    '--button-fg-ghost',
    '--button-bg-danger',
    '--button-bg-danger-hover',
    '--button-fg-danger',
    '--button-bg-disabled',
    '--button-fg-disabled',
    '--button-border-disabled',
    '--button-radius',
    '--button-height-sm',
    '--button-height-md',
    '--button-height-lg',
    '--button-pad-x',
    '--button-gap',
    '--focus-ring-color',
    '--focus-ring-width',
    '--focus-ring-offset',
  ],
  combobox: [
    '--combobox-bg',
    '--combobox-fg',
    '--combobox-fg-placeholder',
    '--combobox-border',
    '--combobox-border-invalid',
    '--combobox-radius',
    '--combobox-height',
    '--combobox-pad-x',
    '--combobox-list-bg',
    '--combobox-list-border',
    '--combobox-list-radius',
    '--combobox-option-bg',
    '--combobox-option-bg-hover',
    '--combobox-option-bg-selected',
    '--combobox-option-fg',
    '--combobox-option-fg-selected',
    '--focus-ring-color',
    '--focus-ring-width',
    '--focus-ring-offset',
  ],
  dialog: [
    '--dialog-overlay',
    '--dialog-bg',
    '--dialog-fg',
    '--dialog-fg-description',
    '--dialog-border',
    '--dialog-radius',
    '--dialog-pad',
    '--dialog-max-width',
    '--focus-ring-color',
    '--focus-ring-width',
    '--focus-ring-offset',
  ],
  badge: [
    '--badge-bg-neutral',
    '--badge-fg-neutral',
    '--badge-bg-accent',
    '--badge-fg-accent',
    '--badge-bg-success',
    '--badge-fg-success',
    '--badge-bg-warning',
    '--badge-fg-warning',
    '--badge-bg-danger',
    '--badge-fg-danger',
    '--badge-radius',
    '--badge-pad-x',
    '--badge-font-size',
  ],
};

const KEYBOARD_MAPS: Readonly<
  Record<WorkbenchComponentId, ReadonlyArray<WorkbenchKeyboardEntry>>
> = {
  button: [
    { key: 'Tab', behavior: 'Moves focus in and out of the button.' },
    {
      key: 'Enter / Space',
      behavior:
        'Activates native button. When asChild renders a link, Enter follows the link and Space is not captured.',
    },
  ],
  combobox: [
    {
      key: 'ArrowDown / ArrowUp / Alt+ArrowDown',
      behavior: 'Opens the listbox and moves the active option, skipping disabled options.',
    },
    {
      key: 'Home / End',
      behavior: 'Moves to the first or last enabled option while open.',
    },
    { key: 'Enter', behavior: 'Selects the active option and closes the listbox.' },
    {
      key: 'Escape',
      behavior: 'Closes the listbox and keeps focus on the combobox input.',
    },
    { key: 'Tab', behavior: 'Closes the listbox and moves focus to the next stop.' },
  ],
  dialog: [
    {
      key: 'Tab / Shift+Tab',
      behavior: 'Cycles focus strictly inside the modal dialog surface.',
    },
    {
      key: 'Escape',
      behavior: 'Closes the dialog and restores focus to the trigger button.',
    },
  ],
  badge: [{ key: 'None', behavior: 'Not focusable. No keys captured.' }],
};

const COMBOBOX_OPTIONS: ReadonlyArray<{
  value: string;
  label: string;
  disabled?: boolean;
}> = [
  { value: 'architecture', label: 'Architecture Specification' },
  { value: 'tokens', label: 'Canonical Token Contract' },
  { value: 'legacy', label: 'Deprecated Theme Adapter (Unavailable)', disabled: true },
  { value: 'a11y', label: 'WCAG AAA Verification' },
];

function isColorPrimitive(name: PrimitiveTokenName): name is ColorPrimitiveTokenName {
  return name in COLOR_PRIMITIVES_LIGHT;
}

function resolvePrimitiveFallback(name: PrimitiveTokenName, theme: ThemeMode): string {
  if (isColorPrimitive(name)) {
    return theme === 'dark' ? COLOR_PRIMITIVES_DARK[name] : COLOR_PRIMITIVES_LIGHT[name];
  }
  return METRIC_PRIMITIVES[name as MetricPrimitiveTokenName];
}

function resolveSemanticTokenValue(
  tokenName: SemanticTokenName,
  theme: ThemeMode,
  stageNode: HTMLElement | null
): WorkbenchTokenEntry {
  const aliasTarget = SEMANTIC_TOKEN_ALIASES[tokenName];

  if (stageNode && typeof window !== 'undefined') {
    const computed = window.getComputedStyle(stageNode);
    const directValue = computed.getPropertyValue(tokenName).trim();
    if (directValue && !directValue.startsWith('var(')) {
      return { name: tokenName, aliasOf: aliasTarget, value: directValue };
    }
    if (aliasTarget !== '#00000000') {
      const primitiveComputed = computed.getPropertyValue(aliasTarget).trim();
      if (primitiveComputed) {
        return { name: tokenName, aliasOf: aliasTarget, value: primitiveComputed };
      }
    }
  }

  if (aliasTarget === '#00000000') {
    return { name: tokenName, aliasOf: aliasTarget, value: '#00000000' };
  }

  return {
    name: tokenName,
    aliasOf: aliasTarget,
    value: resolvePrimitiveFallback(aliasTarget, theme),
  };
}

export const WorkbenchShell: React.FC<WorkbenchShellProps> = ({
  defaultComponent = 'button',
  defaultTheme = 'light',
}) => {
  const [selectedComponent, setSelectedComponent] =
    React.useState<WorkbenchComponentId>(defaultComponent);
  const [theme, setTheme] = React.useState<ThemeMode>(defaultTheme);

  const [propState, setPropState] = React.useState<WorkbenchPropStateMap>({
    button: {
      variant: 'solid',
      size: 'md',
      disabled: false,
      asChild: false,
    },
    combobox: {
      disabled: false,
      invalid: false,
      open: false,
      value: 'architecture',
    },
    dialog: {
      open: false,
      asChild: false,
    },
    badge: {
      variant: 'neutral',
      size: 'md',
      asChild: false,
    },
  });

  const stageNodeRef = React.useRef<HTMLElement | null>(null);
  const dialogTriggerRef = React.useRef<HTMLButtonElement | null>(null);
  const [computedTokens, setComputedTokens] = React.useState<ReadonlyArray<WorkbenchTokenEntry>>(
    []
  );

  React.useEffect(() => {
    const tokenNames = COMPONENT_TOKENS[selectedComponent];
    const resolved = tokenNames.map((tokenName) =>
      resolveSemanticTokenValue(tokenName, theme, stageNodeRef.current)
    );
    setComputedTokens(resolved);
  }, [selectedComponent, theme, propState]);

  const setStageElement = React.useCallback((node: HTMLElement | null) => {
    stageNodeRef.current = node;
  }, []);

  const currentComboboxLabel =
    COMBOBOX_OPTIONS.find((item) => item.value === propState.combobox.value)?.label ??
    'Select an option';

  return (
    <div data-theme={theme} className="strata-workbench-theme-root">
      <div
        data-frame="workbench/shell"
        data-region="workbench/shell"
        role="region"
        aria-label="workbench/shell"
        className="strata-workbench__shell"
      >
        <nav
          data-region="workbench/nav"
          aria-label="workbench/nav"
          className="strata-workbench__nav"
        >
          <div className="strata-workbench__brand">
            <span className="strata-workbench__brand-title">strata-ui</span>
            <Badge.Root variant="accent" size="sm">
              <Badge.Label>WCAG AAA</Badge.Label>
            </Badge.Root>
          </div>

          <ul className="strata-workbench__nav-list" role="list">
            {COMPONENT_LIST.map((item) => {
              const isSelected = selectedComponent === item.id;
              return (
                <li key={item.id} className="strata-workbench__nav-item">
                  <button
                    type="button"
                    aria-current={isSelected ? 'page' : undefined}
                    data-selected={isSelected ? 'true' : undefined}
                    className="strata-workbench__nav-button"
                    onClick={() => setSelectedComponent(item.id)}
                  >
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="strata-workbench__center">
          <section
            data-region="workbench/stage"
            aria-label="workbench/stage"
            className="strata-workbench__stage"
          >
            <div className="strata-workbench__stage-header">
              <span className="strata-workbench__stage-title">
                Stage: {selectedComponent}
              </span>
              <Badge.Root variant="neutral" size="sm">
                <Badge.Label>{theme === 'light' ? 'Light Mode' : 'Dark Mode'}</Badge.Label>
              </Badge.Root>
            </div>

            <div className="strata-workbench__stage-canvas">
              {selectedComponent === 'button' && (
                <div ref={setStageElement}>
                  {propState.button.asChild ? (
                    <Button.Root
                      asChild
                      variant={propState.button.variant}
                      size={propState.button.size}
                      disabled={propState.button.disabled}
                    >
                      <a href="#workbench-stage">
                        <Button.Leading>+</Button.Leading>
                        <Button.Label>Confirm Action Link</Button.Label>
                        <Button.Trailing>→</Button.Trailing>
                      </a>
                    </Button.Root>
                  ) : (
                    <Button.Root
                      variant={propState.button.variant}
                      size={propState.button.size}
                      disabled={propState.button.disabled}
                    >
                      <Button.Leading>+</Button.Leading>
                      <Button.Label>Confirm Action</Button.Label>
                      <Button.Trailing>→</Button.Trailing>
                    </Button.Root>
                  )}
                </div>
              )}

              {selectedComponent === 'combobox' && (
                <div ref={setStageElement} className="strata-workbench__combobox-stage">
                  <Combobox.Root
                    value={propState.combobox.value}
                    onValueChange={(nextValue) =>
                      setPropState((prev) => ({
                        ...prev,
                        combobox: { ...prev.combobox, value: nextValue },
                      }))
                    }
                    open={propState.combobox.open}
                    onOpenChange={(nextOpen) =>
                      setPropState((prev) => ({
                        ...prev,
                        combobox: { ...prev.combobox, open: nextOpen },
                      }))
                    }
                    disabled={propState.combobox.disabled}
                    invalid={propState.combobox.invalid}
                  >
                    <Combobox.Input aria-label={currentComboboxLabel}>
                      {currentComboboxLabel}
                    </Combobox.Input>
                    <Combobox.Listbox aria-label="Specification Options">
                      {COMBOBOX_OPTIONS.map((option) => (
                        <Combobox.Option
                          key={option.value}
                          value={option.value}
                          disabled={option.disabled}
                          textValue={option.label}
                        >
                          <Combobox.OptionLabel>{option.label}</Combobox.OptionLabel>
                        </Combobox.Option>
                      ))}
                    </Combobox.Listbox>
                  </Combobox.Root>
                </div>
              )}

              {selectedComponent === 'dialog' && (
                <div ref={setStageElement} className="strata-workbench__dialog-stage">
                  <Button.Root
                    ref={dialogTriggerRef}
                    variant="outline"
                    size="md"
                    onClick={() =>
                      setPropState((prev) => ({
                        ...prev,
                        dialog: { ...prev.dialog, open: true },
                      }))
                    }
                  >
                    <Button.Label>Open Modal Dialog</Button.Label>
                  </Button.Root>

                  <Dialog.Root
                    open={propState.dialog.open}
                    onOpenChange={(nextOpen) =>
                      setPropState((prev) => ({
                        ...prev,
                        dialog: { ...prev.dialog, open: nextOpen },
                      }))
                    }
                    triggerRef={dialogTriggerRef}
                  >
                    <Dialog.Overlay />
                    {propState.dialog.asChild ? (
                      <Dialog.Surface asChild>
                        <section>
                          <Dialog.Title>Confirm Token Publication</Dialog.Title>
                          <Dialog.Description>
                            Publishing updates canonical CSS variables and synchronizes the
                            design contract across all primitives.
                          </Dialog.Description>
                          <Dialog.Actions>
                            <Dialog.Close>Cancel</Dialog.Close>
                            <Button.Root
                              variant="solid"
                              size="sm"
                              onClick={() =>
                                setPropState((prev) => ({
                                  ...prev,
                                  dialog: { ...prev.dialog, open: false },
                                }))
                              }
                            >
                              <Button.Label>Publish Contract</Button.Label>
                            </Button.Root>
                          </Dialog.Actions>
                        </section>
                      </Dialog.Surface>
                    ) : (
                      <Dialog.Surface>
                        <Dialog.Title>Confirm Token Publication</Dialog.Title>
                        <Dialog.Description>
                          Publishing updates canonical CSS variables and synchronizes the
                          design contract across all primitives.
                        </Dialog.Description>
                        <Dialog.Actions>
                          <Dialog.Close>Cancel</Dialog.Close>
                          <Button.Root
                            variant="solid"
                            size="sm"
                            onClick={() =>
                              setPropState((prev) => ({
                                ...prev,
                                dialog: { ...prev.dialog, open: false },
                              }))
                            }
                          >
                            <Button.Label>Publish Contract</Button.Label>
                          </Button.Root>
                        </Dialog.Actions>
                      </Dialog.Surface>
                    )}
                  </Dialog.Root>
                </div>
              )}

              {selectedComponent === 'badge' && (
                <div ref={setStageElement}>
                  {propState.badge.asChild ? (
                    <Badge.Root
                      asChild
                      variant={propState.badge.variant}
                      size={propState.badge.size}
                    >
                      <strong>
                        <Badge.Label>WCAG AAA Verified</Badge.Label>
                      </strong>
                    </Badge.Root>
                  ) : (
                    <Badge.Root
                      variant={propState.badge.variant}
                      size={propState.badge.size}
                    >
                      <Badge.Label>WCAG AAA Verified</Badge.Label>
                    </Badge.Root>
                  )}
                </div>
              )}
            </div>
          </section>

          <section
            data-region="workbench/a11y"
            aria-label="workbench/a11y"
            className="strata-workbench__a11y"
          >
            <div className="strata-workbench__a11y-header">
              <div className="strata-workbench__a11y-focus-spec">
                <span className="strata-workbench__section-heading">Focus Treatment</span>
                <code className="strata-workbench__code-pill">
                  :focus-visible | 2px ring (--size-focus-ring) | 2px offset (--size-focus-offset) | --color-focus-ring
                </code>
              </div>

              <div
                className="strata-workbench__theme-Toggle"
                role="group"
                aria-label="Theme Mode"
              >
                <button
                  type="button"
                  aria-pressed={theme === 'light'}
                  className="strata-workbench__theme-button"
                  onClick={() => setTheme('light')}
                >
                  Light
                </button>
                <button
                  type="button"
                  aria-pressed={theme === 'dark'}
                  className="strata-workbench__theme-button"
                  onClick={() => setTheme('dark')}
                >
                  Dark
                </button>
              </div>
            </div>

            <div className="strata-workbench__keyboard-list">
              {KEYBOARD_MAPS[selectedComponent].map((entry) => (
                <div key={entry.key} className="strata-workbench__keyboard-row">
                  <kbd className="strata-workbench__kbd">{entry.key}</kbd>
                  <span className="strata-workbench__keyboard-desc">{entry.behavior}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="strata-workbench__rail" aria-label="Inspector Rail">
          <section
            data-region="workbench/props"
            aria-label="workbench/props"
            className="strata-workbench__props"
          >
            <h2 className="strata-workbench__section-heading">Props</h2>

            {selectedComponent === 'button' && (
              <div className="strata-workbench__controls-grid">
                <label className="strata-workbench__field">
                  <span className="strata-workbench__field-label">variant</span>
                  <select
                    aria-label="variant"
                    className="strata-workbench__select"
                    value={propState.button.variant}
                    onChange={(e) =>
                      setPropState((prev) => ({
                        ...prev,
                        button: {
                          ...prev.button,
                          variant: e.target.value as ButtonVariant,
                        },
                      }))
                    }
                  >
                    {BUTTON_VARIANTS.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="strata-workbench__field">
                  <span className="strata-workbench__field-label">size</span>
                  <select
                    aria-label="size"
                    className="strata-workbench__select"
                    value={propState.button.size}
                    onChange={(e) =>
                      setPropState((prev) => ({
                        ...prev,
                        button: {
                          ...prev.button,
                          size: e.target.value as ButtonSize,
                        },
                      }))
                    }
                  >
                    {BUTTON_SIZES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="strata-workbench__checkbox-field">
                  <input
                    type="checkbox"
                    checked={propState.button.disabled}
                    onChange={(e) =>
                      setPropState((prev) => ({
                        ...prev,
                        button: { ...prev.button, disabled: e.target.checked },
                      }))
                    }
                  />
                  <span>disabled</span>
                </label>

                <label className="strata-workbench__checkbox-field">
                  <input
                    type="checkbox"
                    checked={propState.button.asChild}
                    onChange={(e) =>
                      setPropState((prev) => ({
                        ...prev,
                        button: { ...prev.button, asChild: e.target.checked },
                      }))
                    }
                  />
                  <span>asChild</span>
                </label>
              </div>
            )}

            {selectedComponent === 'combobox' && (
              <div className="strata-workbench__controls-grid">
                <label className="strata-workbench__checkbox-field">
                  <input
                    type="checkbox"
                    checked={propState.combobox.disabled}
                    onChange={(e) =>
                      setPropState((prev) => ({
                        ...prev,
                        combobox: {
                          ...prev.combobox,
                          disabled: e.target.checked,
                          open: e.target.checked ? false : prev.combobox.open,
                        },
                      }))
                    }
                  />
                  <span>disabled</span>
                </label>

                <label className="strata-workbench__checkbox-field">
                  <input
                    type="checkbox"
                    checked={propState.combobox.invalid}
                    onChange={(e) =>
                      setPropState((prev) => ({
                        ...prev,
                        combobox: { ...prev.combobox, invalid: e.target.checked },
                      }))
                    }
                  />
                  <span>invalid</span>
                </label>

                <label className="strata-workbench__checkbox-field">
                  <input
                    type="checkbox"
                    checked={propState.combobox.open}
                    disabled={propState.combobox.disabled}
                    onChange={(e) =>
                      setPropState((prev) => ({
                        ...prev,
                        combobox: { ...prev.combobox, open: e.target.checked },
                      }))
                    }
                  />
                  <span>open</span>
                </label>
              </div>
            )}

            {selectedComponent === 'dialog' && (
              <div className="strata-workbench__controls-grid">
                <label className="strata-workbench__checkbox-field">
                  <input
                    type="checkbox"
                    checked={propState.dialog.open}
                    onChange={(e) =>
                      setPropState((prev) => ({
                        ...prev,
                        dialog: { ...prev.dialog, open: e.target.checked },
                      }))
                    }
                  />
                  <span>open</span>
                </label>

                <label className="strata-workbench__checkbox-field">
                  <input
                    type="checkbox"
                    checked={propState.dialog.asChild}
                    onChange={(e) =>
                      setPropState((prev) => ({
                        ...prev,
                        dialog: { ...prev.dialog, asChild: e.target.checked },
                      }))
                    }
                  />
                  <span>asChild</span>
                </label>
              </div>
            )}

            {selectedComponent === 'badge' && (
              <div className="strata-workbench__controls-grid">
                <label className="strata-workbench__field">
                  <span className="strata-workbench__field-label">variant</span>
                  <select
                    aria-label="variant"
                    className="strata-workbench__select"
                    value={propState.badge.variant}
                    onChange={(e) =>
                      setPropState((prev) => ({
                        ...prev,
                        badge: {
                          ...prev.badge,
                          variant: e.target.value as BadgeVariant,
                        },
                      }))
                    }
                  >
                    {BADGE_VARIANTS.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="strata-workbench__field">
                  <span className="strata-workbench__field-label">size</span>
                  <select
                    aria-label="size"
                    className="strata-workbench__select"
                    value={propState.badge.size}
                    onChange={(e) =>
                      setPropState((prev) => ({
                        ...prev,
                        badge: {
                          ...prev.badge,
                          size: e.target.value as BadgeSize,
                        },
                      }))
                    }
                  >
                    {BADGE_SIZES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="strata-workbench__checkbox-field">
                  <input
                    type="checkbox"
                    checked={propState.badge.asChild}
                    onChange={(e) =>
                      setPropState((prev) => ({
                        ...prev,
                        badge: { ...prev.badge, asChild: e.target.checked },
                      }))
                    }
                  />
                  <span>asChild</span>
                </label>
              </div>
            )}
          </section>

          <section
            data-region="workbench/tokens"
            aria-label="workbench/tokens"
            className="strata-workbench__tokens"
          >
            <h2 className="strata-workbench__section-heading">Computed Tokens</h2>
            <dl className="strata-workbench__token-list">
              {computedTokens.map((token) => (
                <div key={token.name} className="strata-workbench__token-row">
                  <dt className="strata-workbench__token-name">{token.name}</dt>
                  <dd className="strata-workbench__token-value">{token.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        </aside>
      </div>
    </div>
  );
};

WorkbenchShell.displayName = 'WorkbenchShell';

export const Workbench = {
  Shell: WorkbenchShell,
};