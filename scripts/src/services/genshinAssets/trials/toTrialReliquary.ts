import type { ExcelReliquaryAffixRow } from "#src/models/genshinAssets/stats/ExcelReliquaryAffixRow";
import type { ExcelTrialReliquaryRow } from "#src/models/genshinAssets/trials/ExcelTrialReliquaryRow";
import type { TrialReliquaryPiece } from "#src/models/genshinAssets/trials/TrialReliquaryPiece";
import type { TrialReliquary } from "genshin-world";

import { InvalidOperationError, Operation } from "@esposter/shared";
import { Attribute, attributeLineSchema } from "genshin-world";
import { z } from "zod";

// One trial reliquary as the artifact it is worn as: its level counted from zero, the main stat the game gives it and the
// Sub-stats it carries, each read by its id from the reliquary, main stat and affix tables, and the set and slot its piece holds.
// The trial table counts its level from one, as the reliquary table does
export const toTrialReliquary = (
  { AppendPropList, Id, Level, MainPropId, ReliquaryId }: ExcelTrialReliquaryRow,
  pieceMap: ReadonlyMap<number, TrialReliquaryPiece>,
  mainPropTypeMap: ReadonlyMap<number, string>,
  affixMap: ReadonlyMap<number, ExcelReliquaryAffixRow>,
): TrialReliquary => {
  const piece = pieceMap.get(ReliquaryId);
  if (!piece) throw new InvalidOperationError(Operation.Read, String(Id), "names no reliquary in the reliquary table");
  const mainPropType = mainPropTypeMap.get(MainPropId);
  if (mainPropType === undefined)
    throw new InvalidOperationError(Operation.Read, String(Id), "names no main stat in the main stat table");
  return {
    id: Id,
    level: Level - 1,
    mainAffix: z.enum(Attribute).parse(mainPropType),
    minorAffixes: AppendPropList.map((affixId) => {
      const affix = affixMap.get(affixId);
      if (!affix) throw new InvalidOperationError(Operation.Read, String(Id), `names no affix ${affixId}`);
      return attributeLineSchema.parse({ attribute: affix.propType, value: affix.propValue });
    }),
    rarity: piece.rarity,
    setId: piece.setId,
    slot: piece.slot,
  };
};
