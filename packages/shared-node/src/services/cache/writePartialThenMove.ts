import { getResultAsync, noop } from "@esposter/shared";
import { rmSync } from "node:fs";
import { mkdir, rename } from "node:fs/promises";
import { dirname } from "node:path";

// Writes a file whole at a path: `write` fills a partial file of its own beside the path, and the partial file is renamed
// Onto the path only once `write` has returned, so a write cut short is never taken for the file. A partial file a failed
// Write or rename leaves is removed before the failure is thrown
export const writePartialThenMove = async (
  path: string,
  write: (partialPath: string) => Promise<void>,
): Promise<void> => {
  await mkdir(dirname(path), { recursive: true });
  const partialPath = `${path}.${crypto.randomUUID()}.part`;
  (
    await getResultAsync(async () => {
      await write(partialPath);
      await rename(partialPath, path);
    })
  ).match(noop, (error) => {
    rmSync(partialPath, { force: true });
    throw error;
  });
};
