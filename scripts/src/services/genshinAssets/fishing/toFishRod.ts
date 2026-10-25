import type { ExcelFishRodRow } from "#src/models/genshinAssets/fishing/ExcelFishRodRow";
import type { FishRod } from "genshin-world";

export const toFishRod = (row: ExcelFishRodRow): FishRod => ({
  attackAcc: row.attackAcc,
  attackMag: row.attackMag,
  baseAttack: row.baseAttack,
  cityId: row.cityId,
  id: row.id,
  maxAttack: row.maxAttack,
});
