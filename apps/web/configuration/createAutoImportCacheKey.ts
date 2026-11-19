import type { NuxtHooks } from "nuxt/schema";
import type { Plugin } from "vite";

type Component = Parameters<NuxtHooks["components:extend"]>[0][number];
type Unimport = Parameters<NuxtHooks["imports:context"]>[0];

const IDENTIFIER_REGEX = /[$A-Z_a-z][\w$]*/gu;

// Vitest keys a persisted transform on the file's own content and the resolved config, and neither moves when an
// Auto-import does: an export that leaves one existing file for another leaves every caller's cached transform importing
// It from where it was, and the caller fails until the cache is deleted. Nuxt's import context and component list are
// What those transforms resolve against, so each module's key also carries the entries for the identifiers its own
// Source names — an addition re-keys nothing, and a move re-keys only the files that use what moved.
//
// The hooks go to the Nuxt `defineVitestProject` loads; the plugin reads what they captured once that Nuxt is built, and
// Refuses to run without them, since a key missing its registry is the stale cache back with nothing to say so
// @TODO: no upstream issue — @nuxt/test-utils keys no persisted transform on Nuxt's auto-import registry
export const createAutoImportCacheKey = () => {
  let unimport: Unimport | undefined;
  let components: Component[] = [];
  const hooks = {
    "components:extend": (newComponents) => {
      components = newComponents;
    },
    "imports:context": (context) => {
      unimport = context;
    },
  } satisfies Partial<NuxtHooks>;
  const plugin = {
    // @TODO: no upstream issue — Vitest types configureVitest as returning void, yet awaits every one (`Promise.all` over
    // The sorted hooks in its cli-api chunk), so the async hook the cache key needs reads as misused
    // oxlint-disable-next-line typescript/no-misused-promises, typescript/strict-void-return -- Vitest awaits this hook
    async configureVitest({ defineCacheKeyGenerator }) {
      if (!unimport)
        // oxlint-disable-next-line error-handling/no-bare-error -- the Nuxt configuration loads before `@esposter/shared` is built
        throw new Error(
          "Nuxt never handed over its auto-import context, so a persisted transform could not be keyed on it",
        );
      const sourceMap = new Map<string, string>();
      for (const { as, from, name } of await unimport.getImports()) sourceMap.set(as ?? name, `${from}#${name}`);
      for (const { filePath, pascalName } of components) {
        sourceMap.set(pascalName, filePath);
        sourceMap.set(`Lazy${pascalName}`, filePath);
      }
      defineCacheKeyGenerator(({ sourceCode }) => {
        const entries = new Set<string>();
        for (const [identifier] of sourceCode.matchAll(IDENTIFIER_REGEX)) {
          const source = sourceMap.get(identifier);
          if (source) entries.add(`${identifier}=${source}`);
        }
        return [...entries].toSorted().join(";");
      });
    },
    name: "auto-import-cache-key",
  } satisfies Plugin;
  return { hooks, plugin };
};
