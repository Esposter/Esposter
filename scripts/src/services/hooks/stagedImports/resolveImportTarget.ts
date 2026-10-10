import type { ImportTarget } from "#src/models/hooks/ImportTarget";

import { posix } from "node:path";

// The suffixes the build probes an import with: the path as written, then the source extensions, then an index file.
// A declaration-only folder (`types/index.d.ts`) is one the build resolves too, so its probe is listed
const PROBE_SUFFIXES = [
  "",
  ".ts",
  ".mts",
  ".vue",
  ".json",
  ".d.ts",
  "/index.ts",
  "/index.mts",
  "/index.vue",
  "/index.json",
  "/index.d.ts",
];

// The path a `#` specifier names through its package's `imports` map, a pattern's `*` standing for what it captures.
// Only a string target is a path; a conditions object is not one this resolver reads. Several patterns can match one
// Specifier (`#src/*` and `#src/*.vue` both match `#src/Foo.vue`), and Node takes the most specific: the longest
// Prefix, then the longest pattern. So does this, or a `.vue` import resolves through `#src/*` to `Foo.vue.ts`
const getAliasPath = (specifier: string, packageDirectory: string, aliases: Readonly<Record<string, unknown>>) => {
  let best: undefined | { path: string; patternLength: number; prefixLength: number };
  for (const [pattern, target] of Object.entries(aliases)) {
    if (typeof target !== "string") continue;
    const starIndex = pattern.indexOf("*");
    if (starIndex === -1) {
      if (pattern === specifier) return posix.join(packageDirectory, target);
      continue;
    }
    const prefix = pattern.slice(0, starIndex);
    const suffix = pattern.slice(starIndex + 1);
    const isMatch =
      specifier.length >= prefix.length + suffix.length && specifier.startsWith(prefix) && specifier.endsWith(suffix);
    const isMoreSpecific =
      !best ||
      prefix.length > best.prefixLength ||
      (prefix.length === best.prefixLength && pattern.length > best.patternLength);
    if (isMatch && isMoreSpecific) {
      const captured = specifier.slice(prefix.length, specifier.length - suffix.length);
      best = {
        path: posix.join(packageDirectory, target.replace("*", captured)),
        patternLength: pattern.length,
        prefixLength: prefix.length,
      };
    }
  }
  return best?.path;
};

// The repository paths an import names, or undefined when it names nothing inside the repository.
// A bare package specifier, or a relative path that climbs out of it, names nothing inside it.
export const resolveImportTarget = (
  specifier: string,
  importingPath: string,
  packageDirectory: string,
  aliases: Readonly<Record<string, unknown>>,
): ImportTarget | undefined => {
  // A Vite query (`?worker`, `?url`, `?raw`) names how the module is imported, not a file, so the path is probed without it
  const specifierPath = specifier.split("?")[0] ?? specifier;
  let path: string | undefined;
  if (specifierPath.startsWith(".")) path = posix.join(posix.dirname(importingPath), specifierPath);
  else if (specifierPath.startsWith("#")) path = getAliasPath(specifierPath, packageDirectory, aliases);
  if (path === undefined || path === ".." || path.startsWith("../")) return undefined;
  return { candidates: PROBE_SUFFIXES.map((suffix) => `${path}${suffix}`), path };
};
