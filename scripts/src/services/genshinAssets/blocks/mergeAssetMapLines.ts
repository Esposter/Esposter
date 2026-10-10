import type { AssetMapLines } from "#src/models/genshinAssets/shared/AssetMapLines";

import { InvalidOperationError, Operation } from "@esposter/shared";

// AnimeStudio's asset map merged from its shards' lines, which hold one entry a block of them. The first shard's header
// And trailer are kept, every shard's entries follow in turn, and each entry's source is rebased from its shard's blocks
// Folder to the game's, since AnimeStudio writes the folder it was given. The lines are read one at a time, the map too
// Large to hold whole
const ENTRIES_OPENING = '"AssetEntries": [';
const ENTRIES_CLOSING = "]";
const SOURCE_PREFIX = '"Source": "';

export const mergeAssetMapLines = async function* (shards: AssetMapLines[], gameRoot: string): AsyncGenerator<string> {
  const to = `${toEscaped(gameRoot)}/`;
  const trailer: string[] = [];
  // The last entry read, held until the entry after it shows whether it takes a comma
  let previous: string[] | undefined;
  let shardIndex = -1;
  let from = "";
  let inEntries = false;
  let inTrailer = false;
  let entry: string[] | undefined;
  for await (const { index, line, root } of readShardLines(shards)) {
    if (index !== shardIndex) {
      shardIndex = index;
      from = `${toEscaped(root)}/`;
      inEntries = false;
      inTrailer = false;
      entry = undefined;
    }
    const trimmed = line.trim();
    if (!inEntries) {
      if (index === 0) yield line;
      if (trimmed === ENTRIES_OPENING) inEntries = true;
    } else if (inTrailer) {
      if (index === 0) trailer.push(line);
    } else if (entry) {
      entry.push(trimmed.startsWith(SOURCE_PREFIX) ? rebaseSource(line, from, to, root) : line);
      if (trimmed.startsWith("}")) {
        if (previous) yield* closeEntry(previous, true);
        previous = entry;
        entry = undefined;
      }
    } else if (trimmed.startsWith("{")) entry = [line];
    else if (trimmed === ENTRIES_CLOSING) {
      inTrailer = true;
      if (index === 0) trailer.push(line);
    }
  }
  if (previous) yield* closeEntry(previous, false);
  yield* trailer;
};

// Every shard's lines in turn, each tagged with its shard, so one loop reads the whole merge
const readShardLines = async function* (
  shards: AssetMapLines[],
): AsyncGenerator<{ index: number; line: string; root: string }> {
  for (const [index, { lines, root }] of shards.entries()) yield* tagShardLines(lines, index, root);
};

const tagShardLines = async function* (
  lines: AsyncIterable<string>,
  index: number,
  root: string,
): AsyncGenerator<{ index: number; line: string; root: string }> {
  for await (const line of lines) yield { index, line, root };
};

// A JSON string's characters as they stand between its quotes, so a path is found however the file escapes it
const toEscaped = (path: string): string => JSON.stringify(path).slice(1, -1);

// The source of an entry's line with its shard's root swapped for the game's. A source outside the root is refused:
// The index reads every source relative to the game's blocks, so a stray one would index as another block
const rebaseSource = (line: string, from: string, to: string, root: string): string => {
  const start = line.indexOf(SOURCE_PREFIX) + SOURCE_PREFIX.length;
  if (!line.startsWith(from, start))
    throw new InvalidOperationError(Operation.Read, root, `holds a source outside it: ${line.trim()}`);
  return `${line.slice(0, start)}${to}${line.slice(start + from.length)}`;
};

// The entry's last line, the closing brace, with the comma that says another entry follows it. AnimeStudio writes that
// Comma on every entry but the merged map's last, so the closing line's own comma is set, not added to
const closeEntry = (entry: string[], hasNext: boolean): string[] =>
  entry.map((line, index) => (index === entry.length - 1 ? `${line.replace(/,$/u, "")}${hasNext ? "," : ""}` : line));
