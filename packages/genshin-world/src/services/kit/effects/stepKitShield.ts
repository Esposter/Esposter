import type { KitShield } from "#src/models/kit/KitShield";
import type { KitStrike } from "#src/models/kit/KitStrike";
import type { GroundPoint } from "genshin-engine";

import { createKitBody } from "#src/services/kit/createKitBody";

// A shield's explosion, run on by a step once its seconds have run out or its health is spent, which lands once, from the
// Body on the field and on the ground as a bubble's burst is: the step drops the shield after it
export const stepKitShield = (shield: KitShield, body: GroundPoint): KitStrike | undefined => {
  if (shield.secondsRemaining > 0 || !shield.explosion) return undefined;
  const { combatant, hit } = shield.explosion;
  return { body: createKitBody({ x: body.x, z: body.z }), combatant, hit };
};
