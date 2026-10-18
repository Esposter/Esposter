import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { Attribute } from "#src/models/character/Attribute";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";

// The ATK and Movement SPD a passive raises its wielder by alike, each by the percentage given for the seconds given
export const buffAttackAndMovementSpeed = (
  kitEffectState: KitEffectState,
  characterId: number,
  percentage: number,
  seconds: number,
  source: string,
): void => {
  for (const attribute of [Attribute.AttackPercent, Attribute.MovementSpeed])
    buffKitMember(kitEffectState, characterId, { amount: percentage, attribute, secondsRemaining: seconds, source });
};
