// The shapes `pnpm ai:package:new` writes. A library and a nuxt-module are published under their bare name.
// Both are built by tsdown. A plugin is private, scoped, and ships its source to the Claude Code plugin installer.
export const PackageKind = { Library: "library", NuxtModule: "nuxt-module", Plugin: "plugin" } as const;
export type PackageKind = (typeof PackageKind)[keyof typeof PackageKind];
