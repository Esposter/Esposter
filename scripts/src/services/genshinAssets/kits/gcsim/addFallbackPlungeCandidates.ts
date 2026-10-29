import type { GcsimCharacter } from "#src/models/genshinAssets/kits/gcsim/GcsimCharacter";
import type { GcsimHitbox } from "#src/models/genshinAssets/kits/gcsim/GcsimHitbox";
import type { GcsimKitCandidateWriter } from "#src/models/genshinAssets/kits/gcsim/GcsimKitCandidateWriter";

import {
  GCSIM_PLUNGE_COLLISION_HITBOX_NAME,
  GCSIM_PLUNGE_LANDINGS,
  KIT_LENGTH_KEY,
} from "#src/services/genshinAssets/kits/constants";
import { findGcsimConstant } from "#src/services/genshinAssets/kits/gcsim/findGcsimConstant";
import { findGcsimHitbox } from "#src/services/genshinAssets/kits/gcsim/findGcsimHitbox";
import { readHitmarkSpread } from "#src/services/genshinAssets/kits/gcsim/readHitmarkSpread";
import { STRIKE_TARGETING_AREA } from "genshin-world";

// The plunges and collision of a character with no plunge file of its own, which stand in for the fallback character's,
// Bennett's: each landing's frames and hit, and the collision's, each cited at the fallback's file and line as
// NoActionFile, and the areas are the fallback's hitboxes priced as its own build prices them. The writer is one that
// Defaults its cause to NoActionFile, over the fallback character. The fallback's values come after the kit's
// Own wiki row, as mergeKitSourceCandidates orders them.
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
  for (const [plunge, prefix, hitboxName] of GCSIM_PLUNGE_LANDINGS) {
    const path = `plunges.${plunge}`;
    writer.addNoActionFileRule(`${path}.hits.${KIT_LENGTH_KEY}`, 1);
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
    findGcsimHitbox(plungeFallback.config, "plunge", GCSIM_PLUNGE_COLLISION_HITBOX_NAME),
  );
};
