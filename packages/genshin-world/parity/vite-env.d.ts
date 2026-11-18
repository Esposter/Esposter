/// <reference types="vite/client" />

declare module "virtual:parity-screen-names" {
  // Each screen's `Index.vue` path under `/src/components`, named the way the components barrel names every component
  export const componentNames: Partial<Record<string, string>>;
}
