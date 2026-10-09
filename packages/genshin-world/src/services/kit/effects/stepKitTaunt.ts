import type { KitStrike } from "#src/models/kit/KitStrike";
import type { KitTaunt } from "#src/models/kit/KitTaunt";

// A taunt's explosion, run on by a step: once its seconds have run out or its health is gone it explodes, from its body
// Once, and its seconds are zeroed so the step drops it. While it stands, it strikes nothing
export const stepKitTaunt = (taunt: KitTaunt): KitStrike[] => {
  if (taunt.secondsRemaining > 0 && taunt.health > 0) return [];
  taunt.secondsRemaining = 0;
  return [{ body: taunt.body, combatant: taunt.combatant, hit: taunt.explosion }];
};
