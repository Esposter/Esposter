import type { GcgCharacter } from "#src/models/gcg/GcgCharacter";
import type { GcgZoneCard } from "#src/models/gcg/GcgZoneCard";

import { GcgEffectNameSkillModuleMap } from "#src/services/gcg/cards/gcgEffectNameSkillModuleMap";

// The statuses a character gains when the battle begins, from the passives it holds that give any
export const listGcgStartingStatuses = (character: GcgCharacter): GcgZoneCard[] =>
  character.skills.flatMap(({ effect }) => GcgEffectNameSkillModuleMap.get(effect)?.getStartingStatuses?.() ?? []);
