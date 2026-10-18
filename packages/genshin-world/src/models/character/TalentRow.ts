import type { CombatTalent } from "#src/models/character/CombatTalent";
import type { TalentUpgrade } from "#src/models/character/TalentUpgrade";
import type { TalentUpgradeRefusal } from "#src/models/character/TalentUpgradeRefusal";

// A combat talent's row on the Talents tab: its level, the upgrade its next level takes (none at its last level), and why
// It cannot rise now, or none when it can
export interface TalentRow {
  level: number;
  refusal: TalentUpgradeRefusal | undefined;
  talent: CombatTalent;
  upgrade: TalentUpgrade | undefined;
}
