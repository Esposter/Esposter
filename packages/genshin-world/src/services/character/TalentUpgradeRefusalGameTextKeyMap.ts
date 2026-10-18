import { TalentUpgradeRefusal } from "#src/models/character/TalentUpgradeRefusal";
import { GameTextKey } from "genshin-text";

// Why a combat talent cannot rise now, in the game's words
export const TalentUpgradeRefusalGameTextKeyMap = {
  [TalentUpgradeRefusal.LastLevel]: GameTextKey.TalentMaxLevel,
  [TalentUpgradeRefusal.Materials]: GameTextKey.TalentMaterialsShort,
  [TalentUpgradeRefusal.Mora]: GameTextKey.TalentMoraShort,
  [TalentUpgradeRefusal.Phase]: GameTextKey.TalentPhaseShort,
} as const satisfies Record<TalentUpgradeRefusal, GameTextKey>;
