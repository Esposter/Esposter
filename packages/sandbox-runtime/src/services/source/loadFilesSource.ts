import type { FilesSource } from "@/models/source/FilesSource";
import type { LoadedSource } from "@/models/source/LoadedSource";

import { getResultAsync } from "@esposter/shared";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
// Materializes an in-memory file map into a fresh temp directory so a backend has something on disk
// To run against. dispose() removes the directory so callers never leak temp state — and a failure
// Mid-materialization tears down the partial directory before rethrowing so nothing leaks either.
export const loadFilesSource = async (source: FilesSource): Promise<LoadedSource> => {
  const cwd = await mkdtemp(join(tmpdir(), "sandbox-"));
  const dispose = () => rm(cwd, { force: true, recursive: true });
  const result = await getResultAsync(async () => {
    for (const [relativePath, content] of Object.entries(source.files)) {
      const filePath = join(cwd, relativePath);
      await mkdir(dirname(filePath), { recursive: true });
      await writeFile(filePath, content);
    }
  });
  if (result.isErr()) {
    await dispose();
    throw result.error;
  }
  return { cwd, dispose };
};
