import { TalentUpgradeRefusal } from "#src/models/character/TalentUpgradeRefusal";
import { GameTextKey } from "genshin-text";

// Why a combat talent cannot rise now, in the game's words. A talent at its last level has no row: the screen special-cases
// LastLevel before it looks a refusal up, and it draws no reason for one
export const TalentUpgradeRefusalGameTextKeyMap = {
  [TalentUpgradeRefusal.Materials]: GameTextKey.TalentMaterialsShort,
  [TalentUpgradeRefusal.Mora]: GameTextKey.TalentMoraShort,
  [TalentUpgradeRefusal.Phase]: GameTextKey.TalentPhaseShort,
} as const satisfies Record<Exclude<TalentUpgradeRefusal, TalentUpgradeRefusal.LastLevel>, GameTextKey>;
