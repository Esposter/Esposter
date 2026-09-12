import type { FilesSource } from "#src/models/source/FilesSource";
import type { LoadedSource } from "#src/models/source/LoadedSource";

import { createTemporarySourceDirectory } from "#src/services/source/createTemporarySourceDirectory";
import { getResultAsync, InvalidOperationError, noop, Operation } from "@esposter/shared";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, relative, resolve } from "node:path";
// Materializes an in-memory file map into a fresh temp dir for a backend to run against; a failure
// Mid-write tears down the partial dir before rethrowing.
export const loadFilesSource = async (source: FilesSource): Promise<LoadedSource> => {
  const { cwd, dispose } = await createTemporarySourceDirectory();
  await getResultAsync(async () => {
    for (const [relativePath, content] of Object.entries(source.files)) {
      const filePath = resolve(cwd, relativePath);
      const resolvedRelativePath = relative(cwd, filePath);
      if (resolvedRelativePath.startsWith("..") || isAbsolute(resolvedRelativePath))
        throw new InvalidOperationError(Operation.Create, relativePath, "path escapes sandbox directory");
      await mkdir(dirname(filePath), { recursive: true });
      await writeFile(filePath, content);
    }
  }).match(noop, async (error) => {
    await dispose();
    throw error;
  });
  return { cwd, dispose };
};
