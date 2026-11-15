import { PackageKind } from "#src/models/package/PackageKind";

// A nuxt-module extends the shared Nuxt module base, since Nuxt reads the module's source directly through Node's type
// Stripping
export const getTsconfig = (kind: PackageKind): Record<string, unknown> => ({
  extends:
    kind === PackageKind.NuxtModule
      ? "../configuration/tsconfig.nuxt-module.json"
      : "../configuration/tsconfig.node.json",
});
