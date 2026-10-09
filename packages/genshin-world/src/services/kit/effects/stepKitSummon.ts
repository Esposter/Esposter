import type { KitStrike } from "#src/models/kit/KitStrike";
import type { KitSummon } from "#src/models/kit/KitSummon";
import type { GroundPoint } from "genshin-engine";

// A summon's clock run on by a step: a following summon's body stands where the body on the field stands, and a
// Travelling summon's body moves forward over the seconds it has been travelling. Then each hit whose hitmark falls
// Within the step lands from the summon's body, as the hits of an action do
export const stepKitSummon = (summon: KitSummon, stepSeconds: number, body: GroundPoint): KitStrike[] => {
  const fromSeconds = summon.elapsedSeconds;
  summon.elapsedSeconds += stepSeconds;
  if (summon.isFollowing) {
    summon.body.position.x = body.x;
    summon.body.position.z = body.z;
  }
  if (summon.travel) {
    const { metresPerSecond, startSeconds } = summon.travel;
    const travelledSeconds =
      Math.max(0, summon.elapsedSeconds - startSeconds) - Math.max(0, fromSeconds - startSeconds);
    // Ahead of a body at its facing lies the bearing -sin and -cos of that facing, as computeFacingAngle reads it
    const metres = metresPerSecond * travelledSeconds;
    summon.body.position.x -= Math.sin(summon.body.facing) * metres;
    summon.body.position.z -= Math.cos(summon.body.facing) * metres;
  }
  return summon.hits
    .filter(({ hitmarkSeconds }) => hitmarkSeconds > fromSeconds && hitmarkSeconds <= summon.elapsedSeconds)
    .map((hit) => ({ body: summon.body, combatant: summon.combatant, hit }));
};
