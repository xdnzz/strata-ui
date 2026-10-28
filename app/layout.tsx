import type { ReactNode } from 'react';

export const metadata = {
  title: 'strata-ui workbench',
  description: 'Live component workbench for the strata-ui design system.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
