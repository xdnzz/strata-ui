import { cleanup } from '@testing-library/react';
import type { AxeResults } from 'axe-core';
import { afterEach, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';

function toHaveNoViolations(results: AxeResults) {
  const { violations } = results;
  return {
    pass: violations.length === 0,
    message: () =>
      violations
        .map((violation) => {
          const nodes = violation.nodes.map((node) => node.html).join('\n');
          return `${violation.id}: ${violation.help}\n${nodes}`;
        })
        .join('\n'),
  };
}

expect.extend({ toHaveNoViolations });

afterEach(() => {
  cleanup();
});
