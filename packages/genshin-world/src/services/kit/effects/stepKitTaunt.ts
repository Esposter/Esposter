import type { KitStrike } from "#src/models/kit/KitStrike";
import type { KitTaunt } from "#src/models/kit/KitTaunt";

// A taunt's end, run on by a step: once its seconds have run out or its health is gone its seconds are zeroed so the step
// Drops it, and it explodes from its body once, if it carries an explosion. While it stands, it strikes nothing
export const stepKitTaunt = (taunt: KitTaunt): KitStrike[] => {
  if (taunt.secondsRemaining > 0 && taunt.health > 0) return [];
  taunt.secondsRemaining = 0;
  return taunt.explosion ? [{ body: taunt.body, combatant: taunt.combatant, hit: taunt.explosion }] : [];
};
