# strata-ui

strata-ui is a headless design system for React. It ships accessible compound components, a typed design-token contract, and CSS that consumes those tokens by their canonical names. The library is built for WCAG AAA in the default theme: text, content-bearing placeholders, control borders, and the focus ring are specified at a minimum contrast of 7:1, and interactive controls use a 44px minimum target size.

Components do not own product copy, routing, or a visual theme beyond the token stylesheet. Callers compose named parts, pass their own content, and style through the published custom properties and `data-*` attributes.

This repository is the library source. It is not published to a package registry, and it does not yet contain the component workbench, a test suite, or npm scripts.

## Requirements

- Node.js 24 or later
- npm 11 or later
- React 19.3 and React DOM 19.3, already declared in `package.json`
- TypeScript 7, with `strict` and `noImplicitAny` enabled in `tsconfig.json`

The styles reference Atkinson Hyperlegible for interface text and IBM Plex Mono for monospaced text. Those families are not vendored. Load them in the host document, or the declared fallbacks (`Segoe UI`, `ui-monospace`) will be used.

## Install

Clone the repository and install the lockfile:

```bash
npm install
```

Check the library with the TypeScript compiler:

```bash
npx tsc --noEmit
```

`package.json` does not define `scripts` yet. Vitest, React Testing Library, jsdom, and vitest-axe are installed for the test suite that will live beside the components. There is no `vitest.config` in the tree.

## Use the styles

Each primitive has its own stylesheet, and every visual value points at a token. Import the token sheet first, then the component sheets you render. In a bundler that accepts CSS imports:

```ts
import "./tokens/tokens.css";
import "./primitives/button/button.css";
import "./primitives/combobox/combobox.css";
import "./primitives/dialog/dialog.css";
import "./primitives/badge/badge.css";
```

`:root` and `[data-theme="light"]` define the light palette. That is the default theme. Set `data-theme="dark"` on an ancestor to switch color primitives. Metric tokens and semantic aliases are declared once. Semantic tokens use `var()` references, so they follow the active palette without a second copy.

```html
<html data-theme="dark">
  <body>...</body>
</html>
```

`--color-bg-muted` and `--color-bg-overlay` are not text backgrounds. `--color-bg-overlay` is the dialog scrim. Disabled text uses `--color-fg-disabled` on `--color-bg-surface` or `--color-bg-canvas`. Opacity stays at `--opacity-disabled: 1`. Inactive text is below the 7:1 floor (5.20:1 in light on canvas, 5.35:1 in dark on surface). That is the WCAG 1.4.3 inactive-component exception, not a fade.

## Use the components

The public entry is `src/index.ts`. Import from there, or from the primitive file when you want a narrower module.

```tsx
import { Badge, Button, Combobox, Dialog } from "./src";
```

Paths above assume the file that imports them can resolve `./src`. This package has no `exports` map yet.

Components are compound. A part rendered outside its root throws. Roots accept controlled and uncontrolled state where noted. `asChild` swaps the host element through `Slot` and merges `className`, `style`, and event handlers onto the single React element child. `Slot` returns `null` when `children` is not one valid element.

### Button

`Button.Root` renders a `<button type="button">`. `variant` is `solid` (default), `outline`, `ghost`, or `danger`. `size` is `sm`, `md` (default), or `lg`. The root exposes `data-part="root"`, `data-variant`, `data-size`, and `data-state`.

`data-state` is derived: `disabled`, then `active`, then `focus-visible`, then `hover`, then `rest`.

```tsx
<Button.Root variant="solid" size="md" onClick={save}>
  <Button.Label>Save changes</Button.Label>
</Button.Root>
```

`Button.Leading` and `Button.Trailing` are presentational and set `aria-hidden="true"`. The accessible name is the text in `Button.Label`, or the text of the child when `asChild` is set.

```tsx
<Button.Root variant="outline" asChild>
  <a href="/tokens">Token reference</a>
</Button.Root>
```

A native button activates with Enter and Space. An `asChild` anchor keeps native link behavior: Enter follows the link, and Space is not captured. `disabled` sets the `disabled` attribute on a native button. With `asChild`, the root sets `aria-disabled` and `tabIndex={-1}` and cancels the click.

### Combobox

The combobox is select-only. `Combobox.Input` is a focusable element with `role="combobox"`, `aria-haspopup="listbox"`, `aria-expanded`, `aria-controls`, and `aria-activedescendant` while the list is open. It is not a text field.

`Combobox.Root` is uncontrolled unless you pass `value` / `onValueChange` or `open` / `onOpenChange`. `disabled` forces the list closed. `invalid` sets `aria-invalid` on the input and `data-state="invalid"` when the control is not disabled. The default placeholder is `Select an option`.

```tsx
<Combobox.Root value={city} onValueChange={setCity} invalid={city === ""}>
  <Combobox.Input />
  <Combobox.Listbox>
    <Combobox.Option value="recife" textValue="Recife">
      <Combobox.OptionLabel>Recife</Combobox.OptionLabel>
    </Combobox.Option>
    <Combobox.Option value="olinda" disabled textValue="Olinda">
      <Combobox.OptionLabel>Olinda</Combobox.OptionLabel>
    </Combobox.Option>
  </Combobox.Listbox>
</Combobox.Root>
```

`textValue` is the string stored as the option label. If you omit it, a string child is used, and any other child falls back to `value`. The closed input shows that label. `Combobox.Listbox` sets `role="listbox"` and `hidden` while closed.

Keyboard, handled on the input:

| Key | Behavior |
| --- | --- |
| ArrowDown, Alt+ArrowDown | Opens the list, or moves to the next enabled option |
| ArrowUp | Opens the list on the last enabled option, or moves to the previous one |
| Home, End | Moves to the first or last enabled option while open |
| Enter | Selects the active option, closes, and returns focus to the input |
| Escape | Closes and keeps focus on the input |
| Tab | Closes, then moves to the next focus stop |

Clicking the input toggles the list. Clicking an enabled option selects it.

### Dialog

`Dialog.Root` holds open state. Pass `open` and `onOpenChange` for a controlled dialog, or `defaultOpen` for an uncontrolled one. `triggerRef` is the element that receives focus when the dialog closes. If it is omitted, focus returns to the element that was active when the dialog opened.

`Dialog.Surface` renders `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, and `aria-describedby`. `Dialog.Title` and `Dialog.Description` carry the matching ids. Render both. The surface moves focus to the first focusable descendant on open, or focuses itself when there is none. Tab and Shift+Tab cycle inside the surface. Escape closes the dialog.

```tsx
const triggerRef = useRef<HTMLButtonElement>(null);

<Button.Root ref={triggerRef} onClick={() => setOpen(true)}>
  <Button.Label>Delete project</Button.Label>
</Button.Root>

<Dialog.Root open={open} onOpenChange={setOpen} triggerRef={triggerRef}>
  <Dialog.Overlay />
  <Dialog.Surface>
    <Dialog.Title>Delete this project</Dialog.Title>
    <Dialog.Description>
      The project and its tokens will be removed.
    </Dialog.Description>
    <Dialog.Actions>
      <Dialog.Close>Cancel</Dialog.Close>
      <Button.Root variant="danger" onClick={confirmDelete}>
        <Button.Label>Delete</Button.Label>
      </Button.Root>
    </Dialog.Actions>
  </Dialog.Surface>
</Dialog.Root>
```

`Dialog.Overlay` is `aria-hidden` and renders only while open. `Dialog.Close` is a button that sets open to false. `asChild` is available on `Dialog.Surface` and `Dialog.Close`.

The surface does not render a portal and does not set `inert` on the rest of the page. The focus trap covers Tab from inside the surface. Place the dialog where your host can stack it with `--z-dialog`.

### Badge

`Badge` is not focusable and has no keyboard behavior. The visible label is the accessible name. Do not use an icon as the only content.

```tsx
<Badge.Root variant="warning" size="sm">
  <Badge.Label>Contrast review</Badge.Label>
</Badge.Root>
```

`variant` is `neutral` (default), `accent`, `success`, `warning`, or `danger`. `size` is `sm` or `md` (default).

## Design tokens

The canonical name of a token is the CSS custom property, including the `--` prefix. The same literal is the TypeScript token name and the name reserved for the matching Figma variable. There is no public camelCase alias.

`src/tokens/tokens.ts` exports:

- `TokenName`, the union of every primitive and semantic name
- `COLOR_PRIMITIVES_LIGHT` and `COLOR_PRIMITIVES_DARK`
- `METRIC_PRIMITIVES`, shared by both modes
- `SEMANTIC_TOKEN_ALIASES`, mapping each component token to a primitive or, for `--button-bg-ghost` only, `#00000000`

```ts
import {
  COLOR_PRIMITIVES_LIGHT,
  SEMANTIC_TOKEN_ALIASES,
  type TokenName,
} from "./src/tokens/tokens";

const canvas: TokenName = "--color-bg-canvas";
const lightCanvas = COLOR_PRIMITIVES_LIGHT[canvas];
const buttonFill = SEMANTIC_TOKEN_ALIASES["--button-bg-solid"];
```

Color primitives cover canvas, surface, subtle, muted, inverse, overlay, foreground, accent, danger, success, warning, border, and focus ring, including hover and on-fill pairs. Metrics cover space, radius, control size, type, duration, easing, and z-index. Semantic tokens are the button, combobox, dialog, badge, and focus-ring aliases used by the stylesheets.

Focus treatment is `:focus-visible`, a 2px ring, and a 2px offset, colored with `--color-focus-ring`. Component CSS also keys off `data-state="focus-visible"` where the part tracks that state in React.

## Accessibility contract

| Rule | Implementation |
| --- | --- |
| Text, placeholder, border, and focus ring | Minimum 7:1 against the surfaces those tokens are allowed to sit on |
| Target size | `--size-target-min` is 44px. Control heights are 44px, 48px, and 56px |
| Keyboard | Button, select-only combobox, and modal dialog follow the patterns documented above |
| Focus | `:focus-visible` only, using `--focus-ring-color`, `--focus-ring-width`, and `--focus-ring-offset` |
| Names | Visible text. Decorative leading and trailing icons are `aria-hidden` |
| Disabled | Color, not opacity. Native `disabled` on button and dialog close. `aria-disabled` where the root is polymorphic |
| Badge | No tabindex. The label is the name |

The combobox and dialog throw if a part is rendered without its root. That failure is intentional: the ARIA relationships are owned by the root context.

## Repository layout

```
src/
  index.ts
  tokens/
    tokens.ts
    tokens.css
  primitives/
    slot/slot.tsx
    button/
    combobox/
    dialog/
    badge/
```

Each primitive directory holds the component, its props, and its stylesheet. `Slot` is the `asChild` primitive. It merges class names, inline styles, and `on*` handlers, running the child handler before the slot handler.

Variant literals in code are the literals reserved for Figma component properties: `solid`, `outline`, `ghost`, `danger`, `neutral`, `accent`, `success`, `warning`, `sm`, `md`, `lg`, `rest`, `hover`, `active`, `focus-visible`, `disabled`, `open`, `invalid`, `selected`.

## Engineering contract

Source files under `.ts`, `.tsx`, and `.css` contain no comments. Public types stay generic at polymorphic roots. `any` is rejected by review and by `noImplicitAny`.

Tests, when added, are written in English and run through Vitest, React Testing Library, and vitest-axe. Each component is expected to cover keyboard behavior, the accessible name, visible focus, and an axe run with no violations.

Figma parity is part of the contract. A token added in CSS is added to `TokenName` under the same string. A variant added on a component is added as the same string union. The Figma file `strata-ui` is specified and not created in this repository.

## Current scope

Included now:

- Token values for light and dark, and the semantic alias map
- `Slot`, `Button`, `Combobox`, `Dialog`, and `Badge`
- Stylesheets bound to those tokens
- A strict `tsconfig.json` whose `include` is `src`

Not in this tree yet:

- npm `scripts`, package `name`, and an `exports` map
- Vitest configuration and component tests
- The workbench frames (`workbench/shell` and its nav, stage, props, tokens, and accessibility regions)
- A Next.js application, even though `next` is installed
- Font files for Atkinson Hyperlegible and IBM Plex Mono
