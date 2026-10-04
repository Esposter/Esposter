// @TODO: no upstream issue — the two declarations Nuxt's server project lacks go once each package types its own:
// `import.meta.env` for code under `shared/`, which Nitro 3's `ImportMeta` leaves out, and the hook nuxt-security
// Calls but declares on Nitro 2's `nitropack` alone
/// <reference types="nitro/types" />
import type { NuxtSecurityRouteRules } from "nuxt-security";

declare global {
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

declare module "nitro/types" {
  interface NitroRuntimeHooks {
    "nuxt-security:routeRules": (routeRules: Record<string, NuxtSecurityRouteRules>) => void;
  }
}
