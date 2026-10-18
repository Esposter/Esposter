import type { Character } from "#src/models/character/Character";
import type { CombatTalent } from "#src/models/character/CombatTalent";
import type { TalentRow } from "#src/models/character/TalentRow";
import type { TalentUpgradeMap } from "#src/models/character/TalentUpgradeMap";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { Wallet } from "#src/models/inventory/Wallet";

import { COMBAT_TALENT_ORDER } from "#src/services/character/constants";
import { getTalentUpgrade } from "#src/services/character/getTalentUpgrade";
import { getTalentUpgradeRefusal } from "#src/services/character/getTalentUpgradeRefusal";

// Each combat talent's row on the Talents tab, in the order the tab lists them: the upgrades of each talent are read from
// The talent upgrade map by the proud skill group its character's kit names for it, and a group with none is at its last
// Level
export const getTalentRows = (
  character: Character,
  talentGroupIds: Record<CombatTalent, number>,
  talentUpgradeMap: TalentUpgradeMap,
  { inventory, wallet }: { inventory: Inventory; wallet: Wallet },
): TalentRow[] =>
  COMBAT_TALENT_ORDER.map((talent) => {
    const upgrades = talentUpgradeMap[talentGroupIds[talent]] ?? [];
    return {
      level: character.talentLevels[talent],
      refusal: getTalentUpgradeRefusal(character, talent, upgrades, { inventory, wallet }),
      talent,
      upgrade: getTalentUpgrade(character, talent, upgrades),
    };
  });
