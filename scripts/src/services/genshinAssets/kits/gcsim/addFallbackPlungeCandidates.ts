import type { GcsimCharacter } from "#src/models/genshinAssets/kits/gcsim/GcsimCharacter";
import type { GcsimKitCandidateWriter } from "#src/models/genshinAssets/kits/gcsim/GcsimKitCandidateWriter";

import { KitProvisionalCause } from "#src/models/genshinAssets/kits/KitProvisionalCause";
import { createCircleReach } from "#src/services/genshinAssets/kits/gcsim/createCircleReach";
import { findGcsimConstant } from "#src/services/genshinAssets/kits/gcsim/findGcsimConstant";
import { findGcsimHitbox } from "#src/services/genshinAssets/kits/gcsim/findGcsimHitbox";
import { readHitmarkSpread } from "#src/services/genshinAssets/kits/gcsim/readHitmarkSpread";
import { KitPlunge, STRIKE_TARGETING_AREA } from "genshin-world";

// The plunges and collision of a character with no plunge file of its own, which take the fallback character's, Bennett's:
// Each landing's frames and hit, and the collision's, each cited at the fallback's file and line as NoActionFile, and the
// Areas are the fallback's too. The writer is one that defaults its cause to NoActionFile, over the fallback character
export const addFallbackPlungeCandidates = (writer: GcsimKitCandidateWriter, plungeFallback: GcsimCharacter): void => {
  const fallbackConfigFile = writer.toFile(plungeFallback.configFile, plungeFallback.folder);
  // A hit of the fallback's, its attack and hitmark both read from the fallback character's plunge file
  const addFallbackHit = (path: string, talentVariable: string, hitmarkName: string) => {
    const hitmark = findGcsimConstant(plungeFallback.constantMap, hitmarkName);
    writer.addHit(
      path,
      {
        attack: plungeFallback.attacks.find((attack) => attack.talentVariable === talentVariable),
        ...readHitmarkSpread(hitmark),
      },
      STRIKE_TARGETING_AREA,
    );
  };
  for (const [plunge, prefix, hitboxName] of [
    [KitPlunge.Low, "low", "Low_Plunge"],
    [KitPlunge.High, "high", "High_Plunge"],
  ] as const) {
    const path = `plunges.${plunge}`;
    const hitbox = findGcsimHitbox(plungeFallback.config, "plunge", hitboxName);
    writer.addNoActionFileRule(`${path}.hits.length`, 1);
    writer.addFrames(`${path}.animationFrames`, `${prefix}PlungeFrames`);
    addFallbackHit(`${path}.hits.0`, `${prefix}Plunge`, `${prefix}PlungeHitmark`);
    if (hitbox?.radius !== undefined)
      writer.add(
        `${path}.hits.0.area`,
        createCircleReach(0, hitbox.radius),
        fallbackConfigFile,
        hitbox.line,
        KitProvisionalCause.NoActionFile,
      );
  }
  addFallbackHit("plungeCollision", "collision", "collisionHitmark");
  const collisionHitbox = findGcsimHitbox(plungeFallback.config, "plunge", "Plunge");
  if (collisionHitbox?.radius !== undefined)
    writer.add(
      "plungeCollision.area",
      createCircleReach(0, collisionHitbox.radius),
      fallbackConfigFile,
      collisionHitbox.line,
      KitProvisionalCause.NoActionFile,
    );
};
