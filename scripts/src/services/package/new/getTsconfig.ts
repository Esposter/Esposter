import { PackageKind } from "#src/models/package/PackageKind";

// A nuxt-module is erasable-only, which is what lets Node strip its types when Nuxt reads the module's source directly
export const getTsconfig = (kind: PackageKind): Record<string, unknown> => ({
  ...(kind === PackageKind.NuxtModule ? { compilerOptions: { erasableSyntaxOnly: true } } : {}),
  extends: "../configuration/tsconfig.node.json",
});
