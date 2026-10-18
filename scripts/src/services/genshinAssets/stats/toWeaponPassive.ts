import type { ExcelEquipAffixRow } from "#src/models/genshinAssets/stats/ExcelEquipAffixRow";
import type { WeaponData } from "genshin-world";

import { toAttributeLines } from "#src/services/genshinAssets/stats/toAttributeLines";

// A weapon's passive from its skill affix's rows: its name by the first rank's text id, each refinement rank's description
// By text id and its numbers padded to the widest rank's last used place so every rank reads one width, and the stats each
// Rank adds, which a wielder carries whatever its passive's conditions
export const toWeaponPassive = (
  affixRows: ExcelEquipAffixRow[],
  notes: string[],
): Pick<
  WeaponData,
  "passiveNameTextId" | "passiveRankAttributeLines" | "passiveRankDescriptionTextIds" | "passiveRankParams"
> => {
  const rankRows = affixRows.toSorted((firstRow, secondRow) => firstRow.level - secondRow.level);
  const [firstRankRow] = rankRows;
  if (!firstRankRow)
    return {
      passiveNameTextId: "",
      passiveRankAttributeLines: [],
      passiveRankDescriptionTextIds: [],
      passiveRankParams: [],
    };

  const width = Math.max(0, ...rankRows.map(({ paramList }) => paramList.findLastIndex((param) => param !== 0) + 1));
  return {
    passiveNameTextId: String(firstRankRow.nameTextMapHash),
    passiveRankAttributeLines: rankRows.map(({ addProps }) => toAttributeLines(addProps, notes)),
    passiveRankDescriptionTextIds: rankRows.map(({ descTextMapHash }) => String(descTextMapHash)),
    passiveRankParams: rankRows.map(({ paramList }) =>
      Array.from({ length: width }, (_value, index) => paramList[index] ?? 0),
    ),
  };
};
