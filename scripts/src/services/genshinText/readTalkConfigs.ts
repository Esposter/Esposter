import type { DumpedTalkConfig } from "#src/models/genshinText/DumpedTalkConfig";

import { EXCEL_DIRECTORY, TALK_CONFIG_TABLE_NAME } from "#src/services/genshinText/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

// Every row of the game's talk table, read from each numbered part the dump splits it into
export const readTalkConfigs = async (): Promise<DumpedTalkConfig[]> => {
  const fileRegex = new RegExp(String.raw`^${TALK_CONFIG_TABLE_NAME}(?:_\d+)?\.json$`, "u");
  const fileNames = (await readdir(EXCEL_DIRECTORY)).filter((fileName) => fileRegex.test(fileName));
  const parts = await Promise.all(
    fileNames.map(async (fileName) =>
      parseMachineJson<DumpedTalkConfig[]>(await readFile(join(EXCEL_DIRECTORY, fileName), "utf8")),
    ),
  );
  return parts.flat();
};
