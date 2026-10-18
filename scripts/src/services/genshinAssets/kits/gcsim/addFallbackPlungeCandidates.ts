import type { GcsimCharacter } from "#src/models/genshinAssets/kits/gcsim/GcsimCharacter";
import type { GcsimHitbox } from "#src/models/genshinAssets/kits/gcsim/GcsimHitbox";
import type { GcsimKitCandidateWriter } from "#src/models/genshinAssets/kits/gcsim/GcsimKitCandidateWriter";

import { findGcsimConstant } from "#src/services/genshinAssets/kits/gcsim/findGcsimConstant";
import { findGcsimHitbox } from "#src/services/genshinAssets/kits/gcsim/findGcsimHitbox";
import { readHitmarkSpread } from "#src/services/genshinAssets/kits/gcsim/readHitmarkSpread";
import { KitPlunge, STRIKE_TARGETING_AREA } from "genshin-world";

// The plunges and collision of a character with no plunge file of its own, which take the fallback character's, Bennett's:
// Each landing's frames and hit, and the collision's, each cited at the fallback's file and line as NoActionFile, and the
// Areas are the fallback's hitboxes priced as its own build prices them. The writer is one that defaults its cause to
// NoActionFile, over the fallback character
export const addFallbackPlungeCandidates = (writer: GcsimKitCandidateWriter, plungeFallback: GcsimCharacter): void => {
  // A hit of the fallback's, its attack and hitmark both read from the fallback character's plunge file
  const addFallbackHit = (
    path: string,
    talentVariable: string,
    hitmarkName: string,
    areaHitbox: GcsimHitbox | undefined,
  ) => {
    const hitmark = findGcsimConstant(plungeFallback.constantMap, hitmarkName);
    writer.addHit(
      path,
      {
        areaHitbox,
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
    writer.addNoActionFileRule(`${path}.hits.length`, 1);
    writer.addFrames(`${path}.animationFrames`, `${prefix}PlungeFrames`);
    addFallbackHit(
      `${path}.hits.0`,
      `${prefix}Plunge`,
      `${prefix}PlungeHitmark`,
      findGcsimHitbox(plungeFallback.config, "plunge", hitboxName),
    );
  }
  addFallbackHit(
    "plungeCollision",
    "collision",
    "collisionHitmark",
    findGcsimHitbox(plungeFallback.config, "plunge", "Plunge"),
  );
};
