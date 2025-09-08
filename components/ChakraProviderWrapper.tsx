// components/ChakraProviderWrapper.tsx
"use client"; // Essential for client-side rendering in Next.js App Router

import { ChakraProvider, defaultConfig, createSystem } from '@chakra-ui/react';

// Extend the default config with your customizations (e.g., fonts from layout.tsx)
const customConfig = {
  ...defaultConfig,
  theme: {
    tokens: {
      ...defaultConfig.theme?.tokens,
      fonts: {
        heading: { value: 'var(--font-geist-sans)' }, // Integrates your Geist fonts
        body: { value: 'var(--font-geist-sans)' },
      },
    },
  },
};

// Create the full system from the config—this is required in v3!
const system = createSystem(customConfig);

export function ChakraProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ChakraProvider value={system}>
      {children}
    </ChakraProvider>
  );
}