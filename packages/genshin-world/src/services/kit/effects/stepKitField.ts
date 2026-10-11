import type { Enemy } from "#src/models/enemy/Enemy";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitField } from "#src/models/kit/KitField";
import type { Party } from "#src/models/party/Party";
import type { GroundPoint } from "genshin-engine";

import { checkIsInKitField } from "#src/services/kit/effects/checkIsInKitField";

// A field's schedule run on by a step: a following field's centre stands where the body stands, then each tick that falls
// Due while the body stands in it runs its tick, and a tick that falls due outside it is passed over
export const stepKitField = (
  field: KitField,
  stepSeconds: number,
  body: GroundPoint,
  context: {
    activeCombatant: Combatant;
    characterIdCombatantMap: Map<number, Combatant>;
    enemyMap: Map<string, Enemy>;
    kitEffectState: KitEffectState;
    party: Party;
  },
): void => {
  if (field.isFollowing) field.centre = { x: body.x, z: body.z };
  field.nextTickSeconds -= stepSeconds;
  while (field.nextTickSeconds <= 0) {
    if (checkIsInKitField(field, body)) field.onTick({ ...context, tickIndex: field.tickIndex });
    field.tickIndex++;
    field.nextTickSeconds += field.tickIntervalSeconds;
  }
};
