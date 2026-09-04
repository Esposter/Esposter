import type { FilesSource } from "#src/models/source/FilesSource";
import type { LoadedSource } from "#src/models/source/LoadedSource";

import { VIRRUN_TEMP_DIR_PREFIX } from "#src/services/exec/util/constants";
import { getResultAsync, InvalidOperationError, noop, Operation } from "@esposter/shared";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
// Materializes an in-memory file map into a fresh temp dir for a backend to run against; a failure
// Mid-write tears down the partial dir before rethrowing.
export const loadFilesSource = async (source: FilesSource): Promise<LoadedSource> => {
  const cwd = await mkdtemp(join(tmpdir(), VIRRUN_TEMP_DIR_PREFIX));
  const dispose = () => rm(cwd, { force: true, recursive: true });
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
