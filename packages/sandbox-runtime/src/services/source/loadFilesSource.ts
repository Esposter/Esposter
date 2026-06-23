import type { FilesSource } from "@/models/source/FilesSource";
import type { LoadedSource } from "@/models/source/LoadedSource";

import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
// Materializes an in-memory file map into a fresh temp directory so a backend has something on disk
// To run against. dispose() removes the directory so callers never leak temp state.
export const loadFilesSource = async (source: FilesSource): Promise<LoadedSource> => {
  const cwd = await mkdtemp(join(tmpdir(), "sandbox-"));
  for (const [relativePath, content] of Object.entries(source.files)) {
    const filePath = join(cwd, relativePath);
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, content);
  }
  return {
    cwd,
    dispose: () => rm(cwd, { force: true, recursive: true }),
  };
};
