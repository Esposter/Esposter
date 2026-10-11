import type { KitStrike } from "#src/models/kit/KitStrike";
import type { KitSummon } from "#src/models/kit/KitSummon";
import type { GroundPoint } from "genshin-engine";

// A summon's clock run on by a step: a following summon's body stands where the body on the field stands, and a
// Travelling summon's body moves forward over the seconds it has been travelling. Then each hit from its next to land on
// Whose hitmark its clock has reached lands from the summon's body, as the hits of an action do, dealt as the summon's
// Kind of attack, pushed into the strikes given
export const stepKitSummon = (
  summon: KitSummon,
  stepSeconds: number,
  body: GroundPoint,
  strikes: KitStrike[],
): void => {
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
  const { attackTag, combatant, hits, target } = summon;
  // A hit whose hitmark is the cast itself falls at the seconds the first step begins at, so it lands on that step
  for (
    let hit = hits[summon.nextHitIndex];
    hit && hit.hitmarkSeconds <= summon.elapsedSeconds;
    hit = hits[++summon.nextHitIndex]
  )
    strikes.push({ attackTag, body: summon.body, combatant, hit, target });
};
