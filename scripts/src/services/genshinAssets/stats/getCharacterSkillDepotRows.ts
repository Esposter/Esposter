import type { ExcelAvatarRow } from "#src/models/genshinAssets/stats/ExcelAvatarRow";
import type { ExcelSkillDepotRow } from "#src/models/genshinAssets/stats/ExcelSkillDepotRow";
import type { ExcelSkillRow } from "#src/models/genshinAssets/stats/ExcelSkillRow";

import { TRAVELER_AVATAR_IDS, TRAVELER_DEFAULT_ELEMENT } from "#src/services/genshinAssets/stats/constants";

// A character's skill sets in the order its talents are read from: as the game lists them, its own form's first, except
// A Traveler's, whose set of the element its form is by default is put ahead of the others, since its own form's names no
// Elemental Skill or burst and each element's form holds them
export const getCharacterSkillDepotRows = (
  { candSkillDepotIds, id, skillDepotId }: Pick<ExcelAvatarRow, "candSkillDepotIds" | "id" | "skillDepotId">,
  skillDepotMap: ReadonlyMap<number, ExcelSkillDepotRow>,
  skillMap: ReadonlyMap<number, ExcelSkillRow>,
): ExcelSkillDepotRow[] => {
  const depotRows = [...new Set([skillDepotId, ...candSkillDepotIds])].flatMap((depotId) => {
    const depotRow = skillDepotMap.get(depotId);
    return depotRow === undefined ? [] : [depotRow];
  });
  if (!TRAVELER_AVATAR_IDS.has(id)) return depotRows;
  const checkIsFormDepot = ({ energySkill }: ExcelSkillDepotRow) =>
    skillMap.get(energySkill)?.costElemType === TRAVELER_DEFAULT_ELEMENT;
  return depotRows.toSorted(
    (firstRow, secondRow) => Number(checkIsFormDepot(secondRow)) - Number(checkIsFormDepot(firstRow)),
  );
};
