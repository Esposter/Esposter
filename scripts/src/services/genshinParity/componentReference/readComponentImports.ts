import { PACKAGE_IMPORT_REGEX, PATH_IMPORT_REGEX } from "#src/services/genshinParity/componentReference/constants";
import { posix } from "node:path";

// The component files a component reaches, read off its source three ways: a `.vue` import by a relative path or
// Through `#src`, a dynamic import of one, and a named import from a genshin package, which that package's components
// Barrel resolves to its file
export const readComponentImports = (
  path: string,
  source: string,
  barrels: ReadonlyMap<string, ReadonlyMap<string, string>>,
): string[] => {
  const packageSource = path.slice(0, path.indexOf("/src/") + "/src".length);
  const pathImports = Array.from(source.matchAll(PATH_IMPORT_REGEX), ({ groups }) => groups?.specifier ?? "").flatMap(
    (specifier) => {
      if (specifier.startsWith("#src/")) return [`${packageSource}/${specifier.slice("#src/".length)}`];
      if (specifier.startsWith(".")) return [posix.join(posix.dirname(path), specifier)];
      return [];
    },
  );
  const packageImports = Array.from(source.matchAll(PACKAGE_IMPORT_REGEX), ({ groups }) => {
    const barrel = barrels.get(groups?.package ?? "");
    return (groups?.names ?? "")
      .split(",")
      .map((name) => barrel?.get(name.trim().split(/\s+as\s+/u)[0] ?? ""))
      .filter((file) => file !== undefined);
  }).flat();
  return [...pathImports, ...packageImports];
};
