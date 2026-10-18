import type { ExcelEquipAffixRow } from "#src/models/genshinAssets/stats/ExcelEquipAffixRow";
import type { WeaponData } from "genshin-world";

// A weapon's passive from its skill affix's rows: its name by the first rank's text id, and each refinement rank's
// Description by text id and its numbers, padded to the widest rank's last used place so every rank reads one width
export const toWeaponPassive = (
  affixRows: ExcelEquipAffixRow[],
): Pick<WeaponData, "passiveNameTextId" | "passiveRankDescriptionTextIds" | "passiveRankParams"> => {
  const rankRows = affixRows.toSorted((firstRow, secondRow) => firstRow.level - secondRow.level);
  const [firstRankRow] = rankRows;
  if (!firstRankRow) return { passiveNameTextId: "", passiveRankDescriptionTextIds: [], passiveRankParams: [] };

  const width = Math.max(0, ...rankRows.map(({ paramList }) => paramList.findLastIndex((param) => param !== 0) + 1));
  return {
    passiveNameTextId: String(firstRankRow.nameTextMapHash),
    passiveRankDescriptionTextIds: rankRows.map(({ descTextMapHash }) => String(descTextMapHash)),
    passiveRankParams: rankRows.map(({ paramList }) =>
      Array.from({ length: width }, (_value, index) => paramList[index] ?? 0),
    ),
  };
};
