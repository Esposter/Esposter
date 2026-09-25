import type { FilesSource } from "#src/models/source/FilesSource";
import type { LoadedSource } from "#src/models/source/LoadedSource";

import { createTemporarySourceDirectory } from "#src/services/source/createTemporarySourceDirectory";
import { getResultAsync, InvalidOperationError, noop, Operation } from "@esposter/shared";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, relative, resolve } from "node:path";

// Materializes an in-memory file map into a fresh temp directory for a backend to run against; a failure
// Mid-write tears down the partial directory before rethrowing.
export const loadFilesSource = async (source: FilesSource): Promise<LoadedSource> => {
  const { cwd, dispose } = await createTemporarySourceDirectory();
  await getResultAsync(async () => {
    // Every path is checked before any file is written, so an escaping one writes nothing; the writes then overlap
    const fileEntries = Object.entries(source.files).map(([relativePath, content]) => {
      const filePath = resolve(cwd, relativePath);
      const resolvedRelativePath = relative(cwd, filePath);
      if (resolvedRelativePath.startsWith("..") || isAbsolute(resolvedRelativePath))
        throw new InvalidOperationError(Operation.Create, relativePath, "path escapes sandbox directory");
      return { content, filePath };
    });
    await Promise.all(
      fileEntries.map(async ({ content, filePath }) => {
        await mkdir(dirname(filePath), { recursive: true });
        await writeFile(filePath, content);
      }),
    );
  }).match(noop, async (error) => {
    await dispose();
    throw error;
  });
  return { cwd, dispose };
};
