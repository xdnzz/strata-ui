# strata-ui

> Headless UI primitives and interactive component workbench engineered for strict WCAG AAA contrast (7:1+), WAI-ARIA APG keyboard parity, polymorphic slot composition, and 1:1 Figma-to-CSS canonical token contracts.

[[https://github.com/xdnzz/strata-ui/actions/workflows/ci.yml/badge.svg]](https://github.com/xdnzz/strata-ui/actions/workflows/ci.yml)
[[https://img.shields.io/badge/TypeScript-Strict-163A5F.svg]](https://www.typescriptlang.org/)
[[https://img.shields.io/badge/WCAG-AAA_(7%3A1%2B]-1B4D32.svg)](https://www.w3.org/WAI/WCAG21/Understanding/contrast-enhanced.html)
[[https://img.shields.io/badge/Vitest_%2B_axe--core-32_Passing-4A453C.svg]](https://vitest.dev/)

**Live Workbench:** [strata-ui.vercel.app](https://strata-ui.vercel.app)

---

## Architectural Principles

Most component libraries drift between design tools and production stylesheets by introducing competing naming layers (camelCase JS theme objects vs. CSS custom properties vs. Figma variables). `strata-ui` eliminates translation layers through four core constraints:

1. **Single Canonical Token Vocabulary:** The canonical token identifier is the exact CSS custom property string (including the `--` prefix). TypeScript string-literal unions (`TokenName`), CSS declarations (`src/tokens/tokens.css`), and Figma variables share the exact same identifier.
2. **WCAG AAA Contrast by Default:** Light (`:root`) and Dark (`[data-theme="dark"]`) palettes maintain a minimum 7:1 contrast ratio across body text, placeholders, borders, and focus indicators. Interactive hit targets enforce a 44px minimum (`--size-target-min`). Disabled controls never fade via opacity (`--opacity-disabled: 1`), relying on explicit surface/foreground token pairs (`5.20:1` light / `5.35:1` dark under the WCAG 1.4.3 inactive component exemption).
3. **Zero-Dependency Polymorphic Slot:** `Slot` merges refs, classes, inline styles, and event handlers without `any` assertions. Setting `asChild` on `Button.Root`, `Combobox.Input`, `Dialog.Surface`, `Dialog.Close`, or `Badge.Root` swaps the underlying DOM element while preserving slot anatomy and ARIA contracts.
4. **WAI-ARIA Authoring Practices Guide (APG) Compliance:** Every interactive primitive implements deterministic keyboard navigation, focus management, and `axe-core` verified semantics.

---

## Primitives & Contracts

| Primitive | Named Parts | Variants & Sizes | APG Keyboard & Focus Contract |
| :--- | :--- | :--- | :--- |
| **Button** | `Root`, `Leading`, `Label`, `Trailing` | `variant`: `solid` \| `outline` \| `ghost` \| `danger`<br>`size`: `sm` \| `md` \| `lg` | `Tab` moves focus. `Enter` and `Space` activate `<button>`. When `asChild` renders `<a>`, `Enter` follows the link and `Space` is not captured. |
| **Combobox** | `Root`, `Input`, `Listbox`, `Option`, `OptionLabel` | `state`: `rest` \| `hover` \| `focus-visible` \| `open` \| `disabled` \| `invalid` | Select-only APG pattern. `ArrowDown`, `ArrowUp`, `Alt+ArrowDown` open and move active option (skipping disabled items). `Home`/`End` jump to bounds. `Enter` selects. `Escape` closes and retains focus. |
| **Dialog** | `Root`, `Overlay`, `Surface`, `Title`, `Description`, `Close`, `Actions` | Modal dialog with focus trap | `Tab` and `Shift+Tab` cycle strictly inside `Dialog.Surface`. `Escape` closes the modal and restores focus to `triggerRef`. |
| **Badge** | `Root`, `Label` | `variant`: `neutral` \| `accent` \| `success` \| `warning` \| `danger`<br>`size`: `sm` \| `md` | Non-interactive status indicator. Visible label provides the accessible name. |

---

## Component Workbench (`src/workbench`)

The interactive workbench (`workbench/shell`, `1440×900`) inspects primitives in isolation across five dedicated regions:

* **`workbench/nav` (`240px`):** Switches the active stage between `Button`, `Combobox`, `Dialog`, and `Badge` with `aria-current="page"`.
* **`workbench/stage`:** Renders the live primitive on `--color-bg-canvas`, including an external trigger button to demonstrate `Dialog` focus restoration.
* **`workbench/props` (`320px` rail):** Mutates live component props (`variant`, `size`, `disabled`, `invalid`, `open`, `asChild`).
* **`workbench/tokens` (`320px` rail):** Reads real-time resolved CSS custom properties from the mounted stage node across Light and Dark modes.
* **`workbench/a11y`:** Displays the active primitive's keyboard map, focus ring contract (`:focus-visible`, `2px` width, `2px` offset, `--color-focus-ring`), and theme switcher.

---

## Repository Structure

```text
src/
├── index.ts
├── tokens/
│   ├── tokens.ts
│   └── tokens.css
├── primitives/
│   ├── slot/
│   ├── button/
│   ├── combobox/
│   ├── dialog/
│   └── badge/
└── workbench/
    ├── workbench.types.ts
    ├── workbench.tsx
    └── workbench.css
```

---

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to launch the Workbench.

### Quality Gates

```bash
npx tsc --noEmit
npx vitest run
npx next build
```

---

## Author

**Danilo Diniz**
* GitHub: [@xdnzz](https://github.com/xdnzz)
* LinkedIn: [Danilo Diniz](https://www.linkedin.com/in/danilosdinizz)

## License

MIT