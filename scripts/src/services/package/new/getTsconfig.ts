import { PackageKind } from "#src/models/package/PackageKind";

// A nuxt-module extends the shared Nuxt module base, which is erasable-only: Nuxt reads the module's source directly, and
// Node strips its types only when nothing in it needs transforming
export const getTsconfig = (kind: PackageKind): Record<string, unknown> => ({
  extends:
    kind === PackageKind.NuxtModule
      ? "../configuration/tsconfig.nuxt-module.json"
      : "../configuration/tsconfig.node.json",
});
