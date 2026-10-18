import type { GcsimCharacter } from "#src/models/genshinAssets/kits/gcsim/GcsimCharacter";
import type { GcsimKitCandidateWriter } from "#src/models/genshinAssets/kits/gcsim/GcsimKitCandidateWriter";

import { GCSIM_PLUNGE_FILE } from "#src/services/genshinAssets/kits/constants";
import { addFallbackPlungeCandidates } from "#src/services/genshinAssets/kits/gcsim/addFallbackPlungeCandidates";
import { findGcsimConstant } from "#src/services/genshinAssets/kits/gcsim/findGcsimConstant";
import { findGcsimHitbox } from "#src/services/genshinAssets/kits/gcsim/findGcsimHitbox";
import { findGcsimTalentLeaf } from "#src/services/genshinAssets/kits/gcsim/findGcsimTalentLeaf";
import { readHitmarkSpread } from "#src/services/genshinAssets/kits/gcsim/readHitmarkSpread";
import { KitPlunge, STRIKE_TARGETING_AREA } from "genshin-world";
import { posix } from "node:path";

// The plunges: each landing's hitmark and frames from `lowPlungeHitmark` and `lowPlungeFrames` and their high twins,
// Its area from the `Low_Plunge` or `High_Plunge` hitbox, and the collision's from `Plunge`. With no plunge file, the
// Fallback character's, Bennett's, take over, as NoActionFile
export const addGcsimPlungeCandidates = (
  { add, addFrames, addHit, toFile }: GcsimKitCandidateWriter,
  gcsim: GcsimCharacter,
  plungeFallback: GcsimCharacter,
  donorWriter: GcsimKitCandidateWriter,
): void => {
  const { attacks, config, constantMap, filePaths } = gcsim;
  const plungeFile = filePaths.find((path) => posix.basename(path) === GCSIM_PLUNGE_FILE);
  if (plungeFile === undefined) {
    addFallbackPlungeCandidates(donorWriter, plungeFallback);
    return;
  }
  for (const [plunge, prefix, hitboxName] of [
    [KitPlunge.Low, "low", "Low_Plunge"],
    [KitPlunge.High, "high", "High_Plunge"],
  ] as const) {
    const path = `plunges.${plunge}`;
    const hitbox = findGcsimHitbox(config, "plunge", hitboxName);
    const hitmark = findGcsimConstant(constantMap, `${prefix}PlungeHitmark`);
    add(`${path}.hits.length`, 1, toFile(plungeFile), hitmark?.line ?? 1);
    addFrames(`${path}.animationFrames`, `${prefix}PlungeFrames`);
    addHit(
      `${path}.hits.0`,
      {
        areaHitbox: hitbox,
        attack: attacks.find(({ talentVariable }) => talentVariable === `${prefix}Plunge`),
        ...readHitmarkSpread(hitmark),
        talentLeaf: findGcsimTalentLeaf(config, `${prefix}Plunge`, []),
      },
      STRIKE_TARGETING_AREA,
    );
  }
  const collisionHitbox = findGcsimHitbox(config, "plunge", "Plunge");
  const collisionHitmark = findGcsimConstant(constantMap, "collisionHitmark");
  addHit(
    "plungeCollision",
    {
      areaHitbox: collisionHitbox,
      attack: attacks.find(({ talentVariable }) => talentVariable === "collision"),
      ...readHitmarkSpread(collisionHitmark),
      talentLeaf: findGcsimTalentLeaf(config, "collision", []),
    },
    STRIKE_TARGETING_AREA,
  );
};
