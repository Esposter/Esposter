import type { PotCompanionTalkRow } from "#src/models/genshinAssets/friendship/PotCompanionTalkRow";
import type { ExcelHomeWorldNpcRow } from "#src/models/genshinAssets/home/ExcelHomeWorldNpcRow";
import type { DumpedTalkConfig } from "#src/models/genshinText/DumpedTalkConfig";

import { FETTER_GT_CONDITION_TYPE } from "#src/services/genshinAssets/friendship/constants";

// Each companion's realm talk that a fetter level gates, at the Friendship Level it opens at. The condition holds the fetter
// Level it is greater than, so the talk opens one level above it. A talk no fetter level gates is none of them, and neither
// Is a row for no companion
export const toPotCompanionTalkRows = (
  npcRows: readonly ExcelHomeWorldNpcRow[],
  talkConfigMap: ReadonlyMap<number, DumpedTalkConfig>,
): PotCompanionTalkRow[] =>
  npcRows.flatMap(({ avatarID, talkIDs = [] }) =>
    talkIDs.flatMap((talkId): PotCompanionTalkRow[] => {
      const fetterLevel = talkConfigMap.get(talkId)?.beginCond.find(({ type }) => type === FETTER_GT_CONDITION_TYPE)
        ?.param?.[1];
      return avatarID === undefined || fetterLevel === undefined
        ? []
        : [{ characterId: avatarID, friendshipLevel: Number(fetterLevel) + 1, talkId }];
    }),
  );
