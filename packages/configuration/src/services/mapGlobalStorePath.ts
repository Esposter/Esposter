import { GLOBAL_STORE_PACKAGE_REGEX } from "#src/services/constants";

// A vendored package from pnpm's global store is written under the folder a repo-local `.pnpm` gives the same package,
// `vendor/pnpm/<name@version>/vendor/`, so its output names no part of the store's location. A scoped name joins its
// Scope with `+`, the way pnpm names the folder.
export const mapGlobalStorePath = (name: string): string =>
  name.replace(
    GLOBAL_STORE_PACKAGE_REGEX,
    (_match: string, scope: string, packageName: string, version: string) =>
      `vendor/pnpm/${scope === "@" ? packageName : `${scope}+${packageName}`}@${version}/vendor/`,
  );
