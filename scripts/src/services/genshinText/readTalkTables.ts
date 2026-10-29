import type { DumpedNpc } from "#src/models/genshinText/DumpedNpc";
import type { TalkTables } from "#src/models/genshinText/TalkTables";

import { NPC_TABLE_NAME } from "#src/services/genshinText/constants";
import { getDialogTextHash } from "#src/services/genshinText/getDialogTextHash";
import { readDialogTable } from "#src/services/genshinText/readDialogTable";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { readManualTextMap } from "#src/services/genshinText/readManualTextMap";
import { readTalkConfigs } from "#src/services/genshinText/readTalkConfigs";

// The manual text map's key for a character's title, the key's prefix before the character's id
const NPC_TITLE_PREFIX = "NPC_TITLE_";

// The dialog, character, talk and manual text tables every talk is read from, read once for all of a build's talks. A
// Dialog's text hash is the key the English text map files its line under, which the table does not always give
export const readTalkTables = async (englishTextMap: ReadonlyMap<string, string>): Promise<TalkTables> => {
  const talkConfigs = await readTalkConfigs();
  const { dialogRows, idKey } = readDialogTable();
  return {
    npcNameTextIdMap: new Map(
      readExcelTable<DumpedNpc>(NPC_TABLE_NAME).map(({ id, nameTextMapHash }) => [String(id), String(nameTextMapHash)]),
    ),
    npcTitleTextIdMap: new Map(
      [...readManualTextMap()]
        .filter(([textMapId]) => textMapId.startsWith(NPC_TITLE_PREFIX))
        .map(([textMapId, hash]) => [textMapId.slice(NPC_TITLE_PREFIX.length), hash]),
    ),
    talkConfigMap: new Map(talkConfigs.map((talkConfig) => [talkConfig.id, talkConfig])),
    talkDialogsMap: Map.groupBy(
      dialogRows.map((dialog) => ({
        dialog: { ...dialog, talkContentTextMapHash: getDialogTextHash(dialog.talkContentTextMapHash, englishTextMap) },
        id: Number(dialog[idKey]),
      })),
      ({ id }) => Math.floor(id / 100),
    ),
  };
};
