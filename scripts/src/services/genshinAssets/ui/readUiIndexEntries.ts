import type { UiIndexEntry } from "#src/models/genshinAssets/ui/UiIndexEntry";

import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { createReadStream } from "node:fs";
import { createInterface } from "node:readline";

// A block's index entries, streamed a line at a time, so a search that stops early reads no further
export const readUiIndexEntries = async function* (indexPath: string): AsyncGenerator<UiIndexEntry> {
  const lines = createInterface({ crlfDelay: Infinity, input: createReadStream(indexPath, "utf8") });
  for await (const line of lines) yield parseMachineJson<UiIndexEntry>(line);
};
