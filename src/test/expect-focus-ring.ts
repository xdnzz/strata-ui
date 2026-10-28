import { expect } from 'vitest';

function styleRules(): CSSStyleRule[] {
  const rules: CSSStyleRule[] = [];
  for (const sheet of Array.from(document.styleSheets)) {
    let cssRules: CSSRuleList;
    try {
      cssRules = sheet.cssRules;
    } catch {
      continue;
    }
    for (const rule of Array.from(cssRules)) {
      if (rule instanceof CSSStyleRule) {
        rules.push(rule);
      }
    }
  }
  return rules;
}

function matchesRule(element: Element, rule: CSSStyleRule): boolean {
  return rule.selectorText.split(',').some((selector) => {
    try {
      return element.matches(selector.trim());
    } catch {
      return false;
    }
  });
}

export function expectToken(name: string, value: string): void {
  const declared = styleRules().find((rule) => rule.style.getPropertyValue(name).trim() === value);
  expect(declared, name).toBeDefined();
}

export function expectVisibleFocusRing(element: HTMLElement): void {
  expect(element.matches(':focus-visible, [data-state="focus-visible"]')).toBe(true);
  const rule = styleRules().find(
    (candidate) =>
      matchesRule(element, candidate) &&
      candidate.style.outline.trim() === 'var(--focus-ring-width) solid var(--focus-ring-color)' &&
      candidate.style.outlineOffset.trim() === 'var(--focus-ring-offset)',
  );
  expect(rule).toBeDefined();
  expectToken('--size-focus-ring', '2px');
  expectToken('--size-focus-offset', '2px');
  expectToken('--focus-ring-width', 'var(--size-focus-ring)');
  expectToken('--focus-ring-offset', 'var(--size-focus-offset)');
  expectToken('--color-focus-ring', '#163A5F');
  expectToken('--focus-ring-color', 'var(--color-focus-ring)');
}

export function expectDisabledOpacity(element: HTMLElement): void {
  const rule = styleRules().find(
    (candidate) =>
      matchesRule(element, candidate) &&
      candidate.style.opacity.trim() === 'var(--opacity-disabled)',
  );
  expect(rule).toBeDefined();
  expectToken('--opacity-disabled', '1');
}
