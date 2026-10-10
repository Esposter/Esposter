import { getResultAsync, noop } from "@esposter/shared";
import { rmSync } from "node:fs";
import { mkdir, rename, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

// Writes data at a path through a partial file of the writer's own beside it, moved in once whole: a write cut short
// Leaves no file a later read takes for whole, and two writers of one path never write into the same partial file. A
// Partial file a failed write or move leaves is removed before the failure is thrown
export const publishFile = async (path: string, data: string | Uint8Array): Promise<void> => {
  await mkdir(dirname(path), { recursive: true });
  const partialPath = `${path}.${crypto.randomUUID()}.part`;
  (
    await getResultAsync(async () => {
      await writeFile(partialPath, data);
      await rename(partialPath, path);
    })
  ).match(noop, (error) => {
    rmSync(partialPath, { force: true });
    throw error;
  });
};
