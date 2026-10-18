import type { KitEffect } from "#src/models/kit/KitEffect";

import { checkIsKitShieldLive } from "#src/services/kit/effects/checkIsKitShieldLive";

// Whether a character is protected by a shield: it is the character on the field while a shield is live on the team, as
// Every shield protects the character on the field whoever cast it, which gcsim's CharacterIsShielded reads of a shield
// With no target of its own
export const checkIsKitShielded = (
  effects: readonly KitEffect[],
  characterId: number,
  activeCharacterId: number | undefined,
): boolean => characterId === activeCharacterId && effects.some((effect) => checkIsKitShieldLive(effect));
