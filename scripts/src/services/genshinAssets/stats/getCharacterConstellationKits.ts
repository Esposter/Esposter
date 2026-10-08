import type { ExcelAvatarRow } from "#src/models/genshinAssets/stats/ExcelAvatarRow";
import type { ExcelAvatarTalentRow } from "#src/models/genshinAssets/stats/ExcelAvatarTalentRow";
import type { ExcelSkillDepotRow } from "#src/models/genshinAssets/stats/ExcelSkillDepotRow";
import type { ExcelSkillRow } from "#src/models/genshinAssets/stats/ExcelSkillRow";
import type { CharacterConstellationKit, Constellation, ConstellationDepot } from "genshin-world";

import { PLAYABLE_AVATAR_USE_TYPE } from "#src/services/genshinAssets/stats/constants";
import { readExcelTable } from "#src/services/genshinAssets/stats/readExcelTable";
import { readTalentActions } from "#src/services/genshinAssets/stats/readTalentActions";
import { toConstellationRaise } from "#src/services/genshinAssets/stats/toConstellationRaise";
import { readTextMap } from "#src/services/genshinText/readTextMap";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { GameLanguage } from "genshin-text";
import { characterConstellationKitSchema, CombatTalent, CONSTELLATION_COUNT } from "genshin-world";

// The positions, in a skill set's list of six, of the constellations that raise a talent: the third and the fifth
const RAISING_POSITIONS: ReadonlySet<number> = new Set([2, 4]);

// Every playable character's constellations, one depot for each skill set that holds any. The six of a set are read in
// The order its list gives them, which is the order the game activates them. A set is left out, with a note, where a
// Constellation names no config in the dump, as Aloy's and a few newer characters' do, since its raise is unknown. Every
// Set's six spend one Stella Fortuna of one item, and only the third and fifth raise a talent
export const getCharacterConstellationKits = (notes: string[]): CharacterConstellationKit[] => {
  const talentMap = new Map(
    readExcelTable<ExcelAvatarTalentRow>("AvatarTalentExcelConfigData").map((row) => [row.talentId, row]),
  );
  const skillDepotMap = new Map(
    readExcelTable<ExcelSkillDepotRow>("AvatarSkillDepotExcelConfigData").map((row) => [row.id, row]),
  );
  const skillMap = new Map(readExcelTable<ExcelSkillRow>("AvatarSkillExcelConfigData").map((row) => [row.id, row]));
  const actionMap = readTalentActions();
  const englishText = readTextMap(GameLanguage.English);
  const getText = (hash: number): string => englishText.get(String(hash)) ?? "";

  const toConstellationDepot = (depotRow: ExcelSkillDepotRow): ConstellationDepot | undefined => {
    const talentRows = (depotRow.talents ?? []).flatMap((talentId) => {
      const talentRow = talentMap.get(talentId);
      return talentRow === undefined ? [] : [talentRow];
    });
    if (talentRows.length === 0) return undefined;
    const [normalAttackSkillId, elementalSkillId] = depotRow.skills;
    const normalAttack = skillMap.get(normalAttackSkillId ?? 0);
    const elementalSkill = skillMap.get(elementalSkillId ?? 0);
    const elementalBurst = skillMap.get(depotRow.energySkill ?? 0);
    if (
      talentRows.length !== CONSTELLATION_COUNT ||
      normalAttack === undefined ||
      elementalSkill === undefined ||
      elementalBurst === undefined
    )
      throw new InvalidOperationError(
        Operation.Read,
        toConstellationDepot.name,
        `depot ${depotRow.id} of six with its skills`,
      );

    const proudSkillGroupIds = {
      [CombatTalent.ElementalBurst]: elementalBurst.proudSkillGroupId ?? 0,
      [CombatTalent.ElementalSkill]: elementalSkill.proudSkillGroupId ?? 0,
      [CombatTalent.NormalAttack]: normalAttack.proudSkillGroupId ?? 0,
    };
    const skillNames = {
      [CombatTalent.ElementalBurst]: getText(elementalBurst.nameTextMapHash),
      [CombatTalent.ElementalSkill]: getText(elementalSkill.nameTextMapHash),
      [CombatTalent.NormalAttack]: getText(normalAttack.nameTextMapHash),
    };
    const costItemIds = new Set(talentRows.map(({ mainCostItemId }) => mainCostItemId));
    if (costItemIds.size !== 1 || talentRows.some(({ mainCostItemCount }) => mainCostItemCount !== 1))
      throw new InvalidOperationError(
        Operation.Read,
        toConstellationDepot.name,
        `depot ${depotRow.id} of one Stella Fortuna per constellation`,
      );

    const constellations: Constellation[] = [];
    for (const [position, talentRow] of talentRows.entries()) {
      const actions = actionMap.get(talentRow.openConfig);
      if (actions === undefined) {
        notes.push(`talent ${talentRow.talentId} has no config in the dump, so depot ${depotRow.id} is left out`);
        return undefined;
      }
      const raise = toConstellationRaise(actions, {
        descriptionText: getText(talentRow.descTextMapHash),
        proudSkillGroupIds,
        skillNames,
      });
      if (RAISING_POSITIONS.has(position) !== (raise !== undefined))
        throw new InvalidOperationError(
          Operation.Read,
          toConstellationDepot.name,
          `${talentRow.openConfig} raises a talent on the wrong constellation`,
        );
      constellations.push({
        descriptionTextId: String(talentRow.descTextMapHash),
        nameTextId: String(talentRow.nameTextMapHash),
        paramList: talentRow.paramList,
        raise,
      });
    }
    return { constellations, depotId: depotRow.id };
  };

  return readExcelTable<ExcelAvatarRow>("AvatarExcelConfigData")
    .filter(({ useType }) => useType === PLAYABLE_AVATAR_USE_TYPE)
    .flatMap(({ candSkillDepotIds, id, skillDepotId }) => {
      const depots = [...new Set([skillDepotId, ...candSkillDepotIds])].flatMap((depotId) => {
        const depotRow = skillDepotMap.get(depotId);
        const constellationDepot = depotRow === undefined ? undefined : toConstellationDepot(depotRow);
        return constellationDepot === undefined ? [] : [constellationDepot];
      });
      return depots.length === 0 ? [] : [characterConstellationKitSchema.parse({ characterId: id, depots })];
    });
};
