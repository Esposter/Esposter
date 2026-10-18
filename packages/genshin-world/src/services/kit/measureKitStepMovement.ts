import type { GroundPoint } from "genshin-engine";

// The ground distance the field character's body moved across a step, which a step hook reads as the movement its kit
// Logs. A swap moves the body to another character, so none is counted on the step it swaps on
export const measureKitStepMovement = ({
  characterId,
  fieldCharacterId,
  from,
  to,
}: {
  characterId: number;
  fieldCharacterId: number | undefined;
  from: GroundPoint;
  to: GroundPoint;
}): number => (fieldCharacterId === characterId ? Math.hypot(to.x - from.x, to.z - from.z) : 0);
