import type { UiIndexEntry } from "#src/models/genshinAssets/ui/UiIndexEntry";

import { createWriteStream } from "node:fs";
import { rename } from "node:fs/promises";
import { finished } from "node:stream/promises";

// A block's index written as JSON lines, one entry a line, through a temporary file renamed over the index once whole,
// so a reader never sees a part-written index
export const writeUiBlockIndex = async (indexPath: string, entries: readonly UiIndexEntry[]): Promise<void> => {
  const temporaryPath = `${indexPath}.tmp`;
  const stream = createWriteStream(temporaryPath, "utf8");
  for (const entry of entries) stream.write(`${JSON.stringify(entry)}\n`);
  stream.end();
  await finished(stream);
  await rename(temporaryPath, indexPath);
};
