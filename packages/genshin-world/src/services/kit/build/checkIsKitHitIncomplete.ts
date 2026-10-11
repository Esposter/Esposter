import type { KitHit } from "#src/models/kit/KitHit";

import { MISSING_KIT_BEHAVIOUR_ID } from "#src/services/kit/build/constants";
import { missingKitBehaviour } from "#src/services/kit/build/missingKitBehaviour";

// Whether a hit's record holds a bubble, a party heal or a stacked hit its behaviour left without what no value can hold:
// The bubble's omen's id, the heal's chance or the stacked hit's status
export const checkIsKitHitIncomplete = ({ bubble, healParty, stackedHit }: Partial<KitHit>): boolean =>
  bubble?.omen.id === MISSING_KIT_BEHAVIOUR_ID ||
  healParty?.chance === missingKitBehaviour ||
  stackedHit?.statusId === MISSING_KIT_BEHAVIOUR_ID;
