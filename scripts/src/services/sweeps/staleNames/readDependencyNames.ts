import { CACHE_DIRECTORY, LOCKFILE_PATH } from "#src/services/shared/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { addWords } from "#src/services/sweeps/staleNames/addWords";
import { readDeclarationPaths } from "#src/services/sweeps/staleNames/readDeclarationPaths";
import { readStorePackageDirectories } from "#src/services/sweeps/staleNames/readStorePackageDirectories";
import { writeCacheFile } from "#src/services/sweeps/staleNames/writeCacheFile";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

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

  writeCacheFile(cachePath, JSON.stringify([...names]));
  return names;
};
