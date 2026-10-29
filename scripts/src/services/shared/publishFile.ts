import { writePartialThenMove } from "#src/services/shared/writePartialThenMove";
import { getResultAsync, noop } from "@esposter/shared";

// The publish each path's last writer queued, so writers of one path move their partial files in one after another:
// On Windows a rename onto a file another rename is replacing at the same moment fails with EPERM
const queuedPublishes = new Map<string, ReturnType<typeof getResultAsync<void>>>();

// Writes data at a path through a partial file of the writer's own beside it, moved in once whole: a write cut short
// Leaves no file a later read takes for whole. Writers of one path publish in the order they were called, so the last
// Call's data is the one left. A partial file a failed write or move leaves is removed before the failure is thrown
export const publishFile = async (path: string, data: string | Uint8Array): Promise<void> => {
  const previousPublish = queuedPublishes.get(path) ?? Promise.resolve();
  // A publish that failed is reported to its own caller, so the publish queued behind it still runs
  const publish = getResultAsync(async () => {
    await previousPublish;
    await writePartialThenMove(path, data);
  });
  queuedPublishes.set(path, publish);
  const result = await publish;
  if (queuedPublishes.get(path) === publish) queuedPublishes.delete(path);
  result.match(noop, (error) => {
    throw error;
  });
};
