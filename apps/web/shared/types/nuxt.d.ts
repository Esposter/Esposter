// @TODO: no upstream issue — `import.meta.env` for code under `shared/`, which Nitro 3's `ImportMeta` leaves out, until
// Nitro's own `ImportMeta` carries it
/// <reference types="nitro/types" />

declare global {
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}
