import type { DumpedDialog } from "#src/models/genshinText/DumpedDialog";
import type { DumpedNpc } from "#src/models/genshinText/DumpedNpc";
import type { TalkTables } from "#src/models/genshinText/TalkTables";

import { DIALOG_TABLE_NAME, NPC_TABLE_NAME, SCRAMBLED_KEY_REGEX } from "#src/services/genshinText/constants";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { readManualTextMap } from "#src/services/genshinText/readManualTextMap";
import { readTalkConfigs } from "#src/services/genshinText/readTalkConfigs";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The manual text map's key for a character's title, the key's prefix before the character's id
const NPC_TITLE_PREFIX = "NPC_TITLE_";

// The dialog, character, talk and manual text tables every talk is read from, read once for all of a build's talks
export const readTalkTables = async (): Promise<TalkTables> => {
  const talkConfigs = await readTalkConfigs();
  const dialogRows = readExcelTable<DumpedDialog & Record<string, unknown>>(DIALOG_TABLE_NAME);
  const idKey = Object.keys(dialogRows[0] ?? {}).find((key) => SCRAMBLED_KEY_REGEX.test(key));
  if (!idKey) throw new InvalidOperationError(Operation.Read, DIALOG_TABLE_NAME, "has no scrambled id field");
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
      dialogRows.map((dialog) => ({ dialog, id: Number(dialog[idKey]) })),
      ({ id }) => Math.floor(id / 100),
    ),
  };
};
