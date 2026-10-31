import { PACKAGE_JSON_FILENAME, REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readWorkspacePackageDirectories } from "#src/services/shared/readWorkspacePackageDirectories";
import { readSweepFilePaths } from "#src/services/sweeps/readSweepFilePaths";
import { TREE_READ_TIMEOUT_MS } from "#src/workspace/constants.test";
import { readJsonFile } from "#src/workspace/readJsonFile.test";
import { SOURCE_CONDITION } from "@esposter/configuration";
import { readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { describe, expect, test } from "vitest";

interface PackageSource {
  directory: string;
  exports: Record<string, unknown>;
  imports: Record<string, string>;
  name: string;
}

interface SourceModule {
  file: string;
  owner: PackageSource;
}

const SPECIFIER_REGEX = /(?:from|import\()\s*"(?<specifier>[^"]+)"/gu;
const WILDCARD = "*";

const checkIsFile = (path: string): boolean => statSync(path, { throwIfNoEntry: false })?.isFile() ?? false;
const readSpecifiers = (file: string): string[] =>
  Array.from(readFileSync(file, "utf8").matchAll(SPECIFIER_REGEX), ({ groups }) => groups?.specifier ?? "");
const readPackageSources = (): PackageSource[] =>
  readWorkspacePackageDirectories(REPOSITORY_ROOT)
    .filter((workspaceDirectory) => workspaceDirectory.startsWith("packages/"))
    .map((workspaceDirectory) => {
      const directory = resolve(REPOSITORY_ROOT, workspaceDirectory);
      const manifest = readJsonFile(join(directory, PACKAGE_JSON_FILENAME)) as {
        exports?: Record<string, unknown>;
        imports?: Record<string, string>;
        name: string;
      };
      return { directory, exports: manifest.exports ?? {}, imports: manifest.imports ?? {}, name: manifest.name };
    });

// A package's source arm for a specifier the way its manifest's `exports` declares it, by the package name and the subpath
const resolveWorkspaceSpecifier = (specifier: string, packages: PackageSource[]): SourceModule | undefined => {
  const owner = packages.find(({ name }) => specifier === name || specifier.startsWith(`${name}/`));
  if (!owner) return undefined;

  const entry = owner.exports[`.${specifier.slice(owner.name.length)}`];
  const source =
    typeof entry === "object" && entry !== null ? (entry as Record<string, unknown>)[SOURCE_CONDITION] : "";
  const file = typeof source === "string" && source !== "" ? resolve(owner.directory, source) : "";
  return checkIsFile(file) ? { file, owner } : undefined;
};

// A package's own `#` imports, by the most specific pattern its manifest's `imports` has for the specifier
const resolveImportSpecifier = (specifier: string, owner: PackageSource): SourceModule | undefined => {
  const matches = Object.entries(owner.imports).flatMap(([pattern, target]) => {
    const [prefix = "", suffix = ""] = pattern.split(WILDCARD);
    return specifier.startsWith(prefix) && specifier.endsWith(suffix) && specifier.length >= pattern.length - 1
      ? [
          {
            length: pattern.length,
            path: target.replace(WILDCARD, specifier.slice(prefix.length, specifier.length - suffix.length)),
          },
        ]
      : [];
  });
  const best = matches.toSorted((firstMatch, secondMatch) => secondMatch.length - firstMatch.length)[0];
  const file = best ? resolve(owner.directory, best.path) : "";
  return checkIsFile(file) ? { file, owner } : undefined;
};

const resolveRelativeSpecifier = (specifier: string, { file, owner }: SourceModule): SourceModule | undefined => {
  const base = resolve(dirname(file), specifier);
  const resolved = [base, `${base}.ts`, join(base, "index.ts")].find((path) => checkIsFile(path));
  return resolved === undefined ? undefined : { file: resolved, owner };
};

const resolveSpecifier = (
  specifier: string,
  module: SourceModule,
  packages: PackageSource[],
): SourceModule | undefined => {
  if (specifier.startsWith(".")) return resolveRelativeSpecifier(specifier, module);
  else if (specifier.startsWith("#")) return resolveImportSpecifier(specifier, module.owner);
  else return resolveWorkspaceSpecifier(specifier, packages);
};

const readChain = (file: string, parents: Map<string, string>): string => {
  const chain = [file];
  for (let parent = parents.get(file); parent !== undefined; parent = parents.get(parent)) chain.unshift(parent);
  return chain.map((path) => relative(REPOSITORY_ROOT, path).replaceAll("\\", "/")).join(" -> ");
};

// Every component the app's server or shared code reaches through a workspace package, as the chain of imports that
// Reaches it. An entry is a package module such code imports; the walk follows `.ts` imports only, since a component
// Is where it stops being safe, not something to read further.
const readComponentChains = (): string[] => {
  const packages = readPackageSources();
  const parents = new Map<string, string>();
  const queue: SourceModule[] = [];
  for (const path of readSweepFilePaths("apps/web/server", "apps/web/shared").filter((file) => file.endsWith(".ts"))) {
    const importer = resolve(REPOSITORY_ROOT, path);
    for (const specifier of readSpecifiers(importer)) {
      const entry = resolveWorkspaceSpecifier(specifier, packages);
      if (entry && !parents.has(entry.file)) {
        parents.set(entry.file, importer);
        queue.push(entry);
      }
    }
  }

  // One entry per module that imports a component, since a barrel reaches every component it re-exports through that one chain
  const chains = new Set<string>();
  for (const module of queue) {
    if (module.file.endsWith(".vue"))
      chains.add(`${readChain(parents.get(module.file) ?? module.file, parents)} -> a component`);
    else if (module.file.endsWith(".ts"))
      for (const specifier of readSpecifiers(module.file)) {
        const next = resolveSpecifier(specifier, module, packages);
        if (next && !parents.has(next.file)) {
          parents.set(next.file, module.file);
          queue.push(next);
        }
      }
  }
  return Array.from(chains);
};

/**
 * The app's server and shared TypeScript projects declare none of the client's Vue globals, so a component one of them
 * loads is checked without `ref`, `computed` and the rest, and one that relies on them reports a wall of
 * `Cannot find name` in files nobody edited. A package's lean entry (`genshin-interface/save`) exists so the server
 * never loads a component; a barrel import on that path is what this reports, with the chain that reached it.
 */
describe("serverComponentGraph", () => {
  test(
    "no module the app's server or shared code imports from a workspace package reaches a component",
    { timeout: TREE_READ_TIMEOUT_MS },
    () => {
      expect.hasAssertions();

      expect(readComponentChains()).toStrictEqual([]);
    },
  );
});
