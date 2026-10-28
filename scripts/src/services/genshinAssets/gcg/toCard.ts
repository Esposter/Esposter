import type { ExcelGcgCardRow } from "#src/models/genshinAssets/gcg/ExcelGcgCardRow";
import type { ExcelGcgSkillRow } from "#src/models/genshinAssets/gcg/ExcelGcgSkillRow";
import type { GcgDeckSliceCard } from "#src/models/genshinAssets/shared/GcgDeckSliceCard";

import { findRow } from "#src/services/genshinAssets/gcg/findRow";
import { toCardCompanion } from "#src/services/genshinAssets/gcg/toCardCompanion";
import { toCardKind } from "#src/services/genshinAssets/gcg/toCardKind";
import { toCardWeapon } from "#src/services/genshinAssets/gcg/toCardWeapon";
import { toCosts } from "#src/services/genshinAssets/gcg/toCosts";

export const toCard = (
  cardRow: ExcelGcgCardRow,
  skillRows: ExcelGcgSkillRow[],
  costTypes: Set<string>,
): GcgDeckSliceCard => ({
  costs: toCosts(cardRow.costList, cardRow.id, costTypes),
  descriptionTextId: cardRow.descTextMapHash,
  effects: cardRow.skillList.map((skillId) => findRow(skillRows, skillId, "skill").skillJson),
  id: cardRow.id,
  isLocation: cardRow.tagList.includes("GCG_TAG_PLACE"),
  kind: toCardKind(cardRow),
  nameTextId: cardRow.nameTextMapHash,
  ...toCardWeapon(cardRow),
  ...toCardCompanion(cardRow),
});
