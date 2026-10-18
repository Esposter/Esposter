import type { DumpedTalkConfig } from "#src/models/genshinText/DumpedTalkConfig";

import { EXCEL_DIRECTORY, TALK_CONFIG_TABLE_NAME } from "#src/services/genshinText/constants";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { readdir } from "node:fs/promises";

// Every row of the game's talk table, read from each numbered part the dump splits it into
export const readTalkConfigs = async (): Promise<DumpedTalkConfig[]> => {
  const tableRegex = new RegExp(String.raw`^(${TALK_CONFIG_TABLE_NAME}(?:_\d+)?)\.json$`, "u");
  const tableNames = (await readdir(EXCEL_DIRECTORY)).flatMap((fileName) => tableRegex.exec(fileName)?.[1] ?? []);
  return tableNames.flatMap((tableName) => readExcelTable<DumpedTalkConfig>(tableName));
};
