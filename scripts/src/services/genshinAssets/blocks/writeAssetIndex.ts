import { SOURCE_PREFIX } from "#src/services/genshinAssets/blocks/constants";
import { parseValue } from "#src/services/genshinAssets/blocks/parseValue";
import {
  ASSET_INDEX_PATH,
  ASSET_MAP_PATH,
  INSTALLED_BLOCKS_DIRECTORY,
} from "#src/services/genshinAssets/shared/constants";
import { once } from "node:events";
import { createReadStream, createWriteStream } from "node:fs";
import { relative } from "node:path";
import { createInterface } from "node:readline";

const NAME_PREFIX = '"Name": "';
const OFFSET_PREFIX = '"Offset": ';
const PATH_ID_PREFIX = '"PathID": ';
const TYPE_PREFIX = '"Type": "';

// The asset map's name, type, block, path ID and file offset of every entry, one tab-separated line each, read a line at
// A time since the map is too large to parse whole. A block is written relative to the blocks folder, so an export can
// Open it, a path ID as its source text, since 64 bits are past what a number holds exactly, and the offset of the
// Serialized file holding the asset in its block, the entry's last field, by which the CAB map names that file
export const writeAssetIndex = async (): Promise<number> => {
  const lines = createInterface({ crlfDelay: Infinity, input: createReadStream(ASSET_MAP_PATH, "utf8") });
  const output = createWriteStream(ASSET_INDEX_PATH, "utf8");
  let name = "";
  let block = "";
  let pathId = "";
  let type = "";
  let count = 0;
  for await (const rawLine of lines) {
    const line = rawLine.trim();
    if (line.startsWith(NAME_PREFIX)) name = parseValue(line, NAME_PREFIX);
    else if (line.startsWith(SOURCE_PREFIX))
      block = relative(INSTALLED_BLOCKS_DIRECTORY, parseValue(line, SOURCE_PREFIX)).replaceAll("\\", "/");
    else if (line.startsWith(PATH_ID_PREFIX)) pathId = line.slice(PATH_ID_PREFIX.length).replace(/,$/u, "");
    else if (line.startsWith(TYPE_PREFIX)) type = parseValue(line, TYPE_PREFIX);
    else if (line.startsWith(OFFSET_PREFIX)) {
      output.write(`${name}\t${type}\t${block}\t${pathId}\t${line.slice(OFFSET_PREFIX.length).replace(/,$/u, "")}\n`);
      count++;
    }
  }
  output.end();
  await once(output, "finish");
  return count;
};
