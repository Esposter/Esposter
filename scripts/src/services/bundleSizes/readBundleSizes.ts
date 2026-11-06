import type { BundleSize } from "#src/models/bundleSizes/BundleSize";

import { readWorkspacePackages } from "#src/services/shared/readWorkspacePackages";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { existsSync, readdirSync, statSync } from "node:fs";
import { resolve } from "node:path";

const TSDOWN_CONFIGURATION_FILENAME = "tsdown.config.ts";
const SOURCE_MAP_EXTENSION = ".map";
// A chunk's name ends in a hash of its content, which changes with the very size the record tracks, so a chunk that grew
// Would read as one file gone and another added. The hash is eight characters with a capital or a digit among them
const CONTENT_HASH_REGEX = /-(?=[\w-]{8}\.)(?=[\w-]*[A-Z\d])[\w-]{8}(?=\.)/u;

// The size of every file a workspace package's build emits. A package is built when it has a tsdown configuration, so a
// Built package with no `dist` fails here instead of being left out of the record, since a missing build is not a size of zero
export const readBundleSizes = (root: string): BundleSize[] =>
  readWorkspacePackages(root).flatMap(({ directory, manifest, workspaceDirectory }) => {
    const packageDirectory = resolve(root, workspaceDirectory, directory);
    if (!existsSync(resolve(packageDirectory, TSDOWN_CONFIGURATION_FILENAME))) return [];

    const packageName = manifest.name ?? directory;
    const distDirectory = resolve(packageDirectory, "dist");
    if (!existsSync(distDirectory))
      throw new InvalidOperationError(Operation.Read, packageName, "it has no dist, so build it first");

    return readdirSync(distDirectory, { recursive: true, withFileTypes: true })
      .filter((entry) => entry.isFile() && !entry.name.endsWith(SOURCE_MAP_EXTENSION))
      .map(({ name, parentPath }) => {
        const filePath = resolve(parentPath, name);
        return {
          bytes: statSync(filePath).size,
          file: filePath
            .slice(distDirectory.length + 1)
            .replaceAll("\\", "/")
            .replace(CONTENT_HASH_REGEX, "-[hash]"),
          packageName,
        };
      });
  });
