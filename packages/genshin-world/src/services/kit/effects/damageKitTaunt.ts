import type { KitTaunt } from "#src/models/kit/KitTaunt";

// Takes health from a taunt, never below none, and records the damage for the next step to send to the kits. It
// Explodes on the next step its health is gone, as stepKitTaunt runs
export const damageKitTaunt = (taunt: KitTaunt, damage: number): void => {
  taunt.health = Math.max(0, taunt.health - damage);
  taunt.damagesTaken.push(damage);
};
