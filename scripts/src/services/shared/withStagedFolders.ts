/* oxlint-disable no-await-in-loop -- Committed prefix: a failure stops the folders behind it, and each folder swapped before it stays swapped */
import { getResultAsync, noop, withFinalizerAsync } from "@esposter/shared";
import { existsSync } from "node:fs";
import { mkdir, mkdtemp, rename, rm } from "node:fs/promises";
import { basename, dirname, join } from "node:path";

// Runs `run` on a staged copy of each folder: an empty sibling made beside it with `mkdtemp`, so the rename that swaps
// It in stays on one volume. A copy replaces its folder only once `run` has finished, and the folder it replaces is set
// Aside until the copy is in place, so a swap that fails puts it back (or logs where it remains, when that put-back fails
// Too) and a run that fails leaves every folder as it was. A copy is removed on success and on failure alike
export const withStagedFolders = <K extends string, R>(
  folders: Record<K, string>,
  run: (staged: Record<K, string>) => Promise<R>,
): Promise<R> => {
  const keys = Object.keys(folders) as K[];
  const staged = new Map<K, string>();
  // Made at once, and the finalizer waits for every one to settle, so a copy still being made when another fails is
  // Removed too
  const copies = keys.map(async (key) => {
    const parent = dirname(folders[key]);
    await mkdir(parent, { recursive: true });
    staged.set(key, await mkdtemp(join(parent, `.${basename(folders[key])}-`)));
  });
  return withFinalizerAsync(
    async () => {
      await Promise.all(copies);
      const result = await run(Object.fromEntries<string>(staged) as Record<K, string>);
      for (const [key, path] of staged) {
        const folder = folders[key];
        const retired = `${path}-retired`;
        const isReplacing = existsSync(folder);
        if (isReplacing) await rename(folder, retired);
        const swapResult = await getResultAsync(() => rename(path, folder));
        await swapResult.match(
          () => rm(retired, { force: true, recursive: true }),
          async (error) => {
            if (isReplacing)
              await getResultAsync(() => rename(retired, folder)).match(noop, (restoreError) => {
                console.error(`The previous export was not put back and remains at ${retired}`, restoreError);
              });
            throw error;
          },
        );
      }
      return result;
    },
    async () => {
      await Promise.allSettled(copies);
      await Promise.all(Array.from(staged.values(), (path) => rm(path, { force: true, recursive: true })));
    },
  );
};
