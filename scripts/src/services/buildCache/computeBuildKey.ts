import { BUILD_CACHE_TSDOWN_FLAGS } from "#src/services/buildCache/constants";
import { listBuildInputPaths } from "#src/services/buildCache/listBuildInputPaths";
import {
  readLockfileImporter,
  readLockfileLines,
  readLockfileSnapshotClosure,
} from "#src/services/buildCache/readLockfileImporter";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";

const hashContent = (content: Buffer | string): string => createHash("sha256").update(content).digest("hex");

// The one name a package's cache is kept under: its own inputs by content, the lockfile's resolved versions of its
// Importer and their transitive snapshots, the Node version it builds under, the tsdown flags it builds with, and the
// Key of every workspace package it links, recursively, so a change anywhere it builds from moves every key downstream.
// Mtimes never enter it.
// A `keys` Map shared across one run hashes each package's sources once, however many packages link it.
export const computeBuildKey = (
  packageDirectory: string,
  repositoryRoot: string = REPOSITORY_ROOT,
  keys: Map<string, string> = new Map<string, string>(),
): string => {
  const lockfileLines = readLockfileLines(repositoryRoot);
  const computeKeyAt = (directory: string, visiting: Set<string>): string => {
    const known = keys.get(directory);
    if (known !== undefined) return known;
    if (visiting.has(directory))
      throw new InvalidOperationError(Operation.Read, directory, "its workspace dependencies form a cycle");

    const importer = readLockfileImporter(lockfileLines, relative(repositoryRoot, directory).split(sep).join("/"));
    const inputs = listBuildInputPaths(directory).map((path) => ({
      content: hashContent(readFileSync(join(directory, path))),
      path,
    }));
    const nextVisiting = new Set([...visiting, directory]);
    const links = importer.linkDependencies.map(({ name, path }) => ({
      key: computeKeyAt(resolve(directory, path), nextVisiting),
      name,
    }));
    const key = hashContent(
      JSON.stringify({
        flags: BUILD_CACHE_TSDOWN_FLAGS,
        importer: importer.lines,
        inputs,
        links,
        nodeVersion: readFileSync(join(repositoryRoot, ".node-version"), "utf8").trim(),
        snapshots: readLockfileSnapshotClosure(lockfileLines, importer.snapshotKeys),
      }),
    );
    keys.set(directory, key);
    return key;
  };

  return computeKeyAt(packageDirectory, new Set());
};
