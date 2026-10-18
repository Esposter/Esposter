import type { GcsimCharacter } from "#src/models/genshinAssets/kits/gcsim/GcsimCharacter";
import type { GcsimKitCandidateWriter } from "#src/models/genshinAssets/kits/gcsim/GcsimKitCandidateWriter";

import { GcsimHitboxCenter } from "#src/models/genshinAssets/kits/gcsim/GcsimHitboxCenter";
import { GcsimHitboxShape } from "#src/models/genshinAssets/kits/gcsim/GcsimHitboxShape";
import { findGcsimConstant } from "#src/services/genshinAssets/kits/gcsim/findGcsimConstant";
import { findGcsimTalentLeaf } from "#src/services/genshinAssets/kits/gcsim/findGcsimTalentLeaf";
import { readGoNumber } from "#src/services/genshinAssets/kits/gcsim/readGoNumber";
import { SKILL_TARGETING_AREA } from "genshin-world";

const CLOUD_TIMINGS = ["cloudTravelTime", "cloudFirstHit", "cloudHitInterval"];

// Mizuki's cloud: its hit is the `cloudDMG` attack's on the primary target within the explosion radius, its multiplier
// The variable's. Its timings are frames of their own: the travel the cloud spends landing, the frames its first hit
// Lands after that, and the interval between its hits. The template's hitmark is the first hit's frames after landing
export const addGcsimCloudCandidates = (
  { add, addHit, toFile }: GcsimKitCandidateWriter,
  { attacks, config, constantMap }: GcsimCharacter,
): void => {
  for (const name of CLOUD_TIMINGS) {
    const timing = findGcsimConstant(constantMap, name);
    const value = readGoNumber(timing?.value);
    if (timing !== undefined && value !== undefined) add(`frames.${name}`, value, toFile(timing.file), timing.line);
  }
  const attack = attacks.find(({ talentVariable }) => talentVariable === "cloudDMG");
  const explosionRadius = findGcsimConstant(constantMap, "cloudExplosionRadius");
  const firstHit = findGcsimConstant(constantMap, "cloudFirstHit");
  const radius = readGoNumber(explosionRadius?.value);
  const firstHitmark = readGoNumber(firstHit?.value);
  if (
    attack === undefined ||
    explosionRadius === undefined ||
    radius === undefined ||
    firstHit === undefined ||
    firstHitmark === undefined
  )
    return;
  addHit(
    "hits.cloud",
    {
      areaHitbox: {
        center: GcsimHitboxCenter.PrimaryTarget,
        file: explosionRadius.file,
        line: explosionRadius.line,
        name: "cloudExplosion",
        radius,
        shape: GcsimHitboxShape.Circle,
      },
      attack,
      hitmark: { file: firstHit.file, line: firstHit.line, value: firstHitmark },
      talentLeaf: findGcsimTalentLeaf(config, "cloudDMG", []),
    },
    SKILL_TARGETING_AREA,
  );
};
