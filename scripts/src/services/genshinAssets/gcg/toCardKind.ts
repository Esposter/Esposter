import type { ExcelGcgCardRow } from "#src/models/genshinAssets/gcg/ExcelGcgCardRow";
import type { GcgCardKind } from "genshin-world";

import { CardTypeKindMap } from "#src/services/genshinAssets/gcg/CardTypeKindMap";
import { EquipmentTagKindMap } from "#src/services/genshinAssets/gcg/EquipmentTagKindMap";
import { invalidRead } from "#src/services/genshinAssets/gcg/invalidRead";

// The card type the dump names, which a modify card's tags refine into the kind of equipment it is
export const toCardKind = ({ cardType, id, tagList }: ExcelGcgCardRow): GcgCardKind => {
  const equipmentKind =
    cardType === "GCG_CARD_MODIFY" ? EquipmentTagKindMap.find(([tag]) => tagList.includes(tag))?.[1] : undefined;
  const kind = equipmentKind ?? CardTypeKindMap.get(cardType);
  if (kind === undefined) throw invalidRead(`card ${id} has the unknown type ${cardType}`);
  return kind;
};
