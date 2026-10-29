import { getResultAsync, noop } from "@esposter/shared";
import { rmSync } from "node:fs";
import { mkdir, rename, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

export const writePartialThenMove = async (path: string, data: string | Uint8Array): Promise<void> => {
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
