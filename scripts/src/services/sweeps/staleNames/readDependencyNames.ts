import { LOCKFILE_PATH, REPOSITORY_ROOT } from "#src/services/shared/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { addWords } from "#src/services/sweeps/staleNames/addWords";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";

const STORE_DIRECTORY = join(REPOSITORY_ROOT, "node_modules", ".pnpm");
// Beside pnpm's own cache directories, under the install it is derived from
const CACHE_DIRECTORY = join(REPOSITORY_ROOT, "node_modules", ".cache", "@esposter", "scripts");
const DECLARATION_REGEX = /\.d\.[cm]?ts$/u;
// The packages pnpm's store holds, each a real directory under `<name@version>/node_modules/` beside symlinks to
// Its own dependencies — the symlinks are skipped, since each points at another entry the walk reaches itself.
// The store's own `node_modules` is the hoisted symlink tree, not a package
const readStorePackageDirectories = (): string[] =>
  readdirSync(STORE_DIRECTORY, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name !== "node_modules")
    .map((entry) => join(STORE_DIRECTORY, entry.name, "node_modules"))
    .flatMap((modulesDirectory) =>
      readdirSync(modulesDirectory, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .flatMap((entry) =>
          entry.name.startsWith("@")
            ? readdirSync(join(modulesDirectory, entry.name), { withFileTypes: true })
                .filter((scopedEntry) => scopedEntry.isDirectory())
                .map((scopedEntry) => join(modulesDirectory, entry.name, scopedEntry.name))
            : [join(modulesDirectory, entry.name)],
        ),
    );
// A package's type declarations, its own nested `node_modules` left out — those are another package's
const readDeclarationPaths = (packageDirectory: string): string[] =>
  readdirSync(packageDirectory, { recursive: true, withFileTypes: true })
    .filter(
      (entry) =>
        entry.isFile() &&
        DECLARATION_REGEX.test(entry.name) &&
        !relative(packageDirectory, entry.parentPath).split(sep).includes("node_modules"),
    )
    .map((entry) => join(entry.parentPath, entry.name));
// Every name an installed package declares: each word of every type declaration in pnpm's store. A page citing a
// Library's API, or a banned one to ban it, names something the tree never held and the library always did, and
// This is what tells that citation from a stale one. The whole store is read rather than the direct dependencies
// Alone, because a library's API is typed where it is defined — `toMatchObject` lives in `@vitest/expect`'s
// Declarations, which vitest's own only re-export — so a page citing it names a package no manifest lists.
//
// The store is a quarter of a gigabyte of declarations and reads in tens of seconds, so the names are cached
// Under the install keyed by the lockfile's hash: the lockfile is what the store is resolved from, so the same
// Lockfile is the same store, and a bump writes a new file rather than invalidating one.
export const readDependencyNames = (): Set<string> => {
  const cachePath = join(
    CACHE_DIRECTORY,
    `dependencyNames-${createHash("sha256").update(readFileSync(LOCKFILE_PATH)).digest("hex")}.json`,
  );
  if (existsSync(cachePath)) return new Set(parseMachineJson<string[]>(readFileSync(cachePath, "utf8")));

  const names = new Set<string>();
  for (const packageDirectory of readStorePackageDirectories())
    for (const declarationPath of readDeclarationPaths(packageDirectory))
      addWords(names, readFileSync(declarationPath, "utf8"));

  mkdirSync(CACHE_DIRECTORY, { recursive: true });
  writeFileSync(cachePath, JSON.stringify([...names]));
  return names;
};
