import type { DumpedNpcBorn } from "#src/models/genshinAssets/residents/DumpedNpcBorn";

import { NPC_BORN_PATH } from "#src/services/genshinAssets/residents/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { readFile } from "node:fs/promises";

// Every NPC the open world's scene places, in the order the scene's birth records list them, which is the order of their
// Ids, so the first record of an NPC is the one its day spot is taken from
export const readNpcBornRecords = async (): Promise<DumpedNpcBorn[]> => {
  const { bornPosList } = parseMachineJson<{ bornPosList: DumpedNpcBorn[] }>(await readFile(NPC_BORN_PATH, "utf8"));
  return bornPosList;
};
