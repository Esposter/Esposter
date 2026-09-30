import { ASSET_INDEX_PATH, ASSET_MAP_PATH, GAME_BLOCKS_DIRECTORY } from "#src/services/genshinAssets/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { once } from "node:events";
import { createReadStream, createWriteStream } from "node:fs";
import { relative } from "node:path";
import { createInterface } from "node:readline";

const NAME_PREFIX = '"Name": "';
const SOURCE_PREFIX = '"Source": "';
const TYPE_PREFIX = '"Type": "';
// Reads a JSON string's value off one line of the asset map, which AnimeStudio writes one field a line
const readValue = (line: string, prefix: string): string =>
  parseMachineJson(`"${line.slice(prefix.length, line.lastIndexOf('"'))}"`);
// The asset map's name, type and block of every entry, one tab-separated line each, read a line at a time since the map
// Is too large to parse whole. A block is written relative to the blocks folder, so an export can open it
export const writeAssetIndex = async (): Promise<number> => {
  const lines = createInterface({ crlfDelay: Infinity, input: createReadStream(ASSET_MAP_PATH, "utf8") });
  const output = createWriteStream(ASSET_INDEX_PATH, "utf8");
  let name = "";
  let block = "";
  let count = 0;
  for await (const rawLine of lines) {
    const line = rawLine.trim();
    if (line.startsWith(NAME_PREFIX)) name = readValue(line, NAME_PREFIX);
    else if (line.startsWith(SOURCE_PREFIX))
      block = relative(GAME_BLOCKS_DIRECTORY, readValue(line, SOURCE_PREFIX)).replaceAll("\\", "/");
    else if (line.startsWith(TYPE_PREFIX)) {
      output.write(`${name}\t${readValue(line, TYPE_PREFIX)}\t${block}\n`);
      count++;
    }
  }
  output.end();
  await once(output, "finish");
  return count;
};
