import type { GcsimCharacter } from "#src/models/genshinAssets/kits/gcsim/GcsimCharacter";
import type { GcsimKitCandidateWriter } from "#src/models/genshinAssets/kits/gcsim/GcsimKitCandidateWriter";

import { KitProvisionalCause } from "#src/models/genshinAssets/kits/KitProvisionalCause";
import { GCSIM_PLUNGE_FILE, NO_ACTION_FILE_PLUNGE_ANIMATION_FRAMES } from "#src/services/genshinAssets/kits/constants";
import { createCircleReach } from "#src/services/genshinAssets/kits/gcsim/createCircleReach";
import { findGcsimConstant } from "#src/services/genshinAssets/kits/gcsim/findGcsimConstant";
import { findGcsimHitbox } from "#src/services/genshinAssets/kits/gcsim/findGcsimHitbox";
import { findGcsimTalentLeaf } from "#src/services/genshinAssets/kits/gcsim/findGcsimTalentLeaf";
import { KitPlunge, STRIKE_TARGETING_AREA } from "genshin-world";
import { posix } from "node:path";

// The plunges: each landing's hitmark and frames from `lowPlungeHitmark` and `lowPlungeFrames` and their high twins,
// Its area from the `Low_Plunge` or `High_Plunge` hitbox, and the collision's from `Plunge`. With no plunge file, the
// Shared rule, its areas the fallback character's
export const addGcsimPlungeCandidates = (
  { add, addFrames, addHit, addNoActionFileRule, toFile }: GcsimKitCandidateWriter,
  gcsim: GcsimCharacter,
  plungeFallback: GcsimCharacter,
): void => {
  const { attacks, config, constantMap, filePaths } = gcsim;
  const plungeFile = filePaths.find((path) => posix.basename(path) === GCSIM_PLUNGE_FILE);
  const hasPlungeFile = plungeFile !== undefined;
  const plungeSource = hasPlungeFile ? gcsim : plungeFallback;
  const fallbackConfigFile = toFile(plungeFallback.configFile, plungeFallback.folder);
  for (const [plunge, prefix, hitboxName] of [
    [KitPlunge.Low, "low", "Low_Plunge"],
    [KitPlunge.High, "high", "High_Plunge"],
  ] as const) {
    const path = `plunges.${plunge}`;
    const hitbox = findGcsimHitbox(plungeSource.config, "plunge", hitboxName);
    if (hasPlungeFile) {
      const hitmark = findGcsimConstant(constantMap, `${prefix}PlungeHitmark`);
      add(`${path}.hits.length`, 1, toFile(plungeFile), hitmark?.line ?? 1);
      addFrames(`${path}.animationFrames`, `${prefix}PlungeFrames`);
      addHit(
        `${path}.hits.0`,
        {
          areaHitbox: hitbox,
          attack: attacks.find(({ talentVariable }) => talentVariable === `${prefix}Plunge`),
          ...(typeof hitmark?.value === "number" && {
            hitmark: { file: hitmark.file, line: hitmark.line, value: hitmark.value },
          }),
          talentLeaf: findGcsimTalentLeaf(config, `${prefix}Plunge`, []),
        },
        STRIKE_TARGETING_AREA,
      );
    } else {
      addNoActionFileRule(`${path}.hits.length`, 1);
      addNoActionFileRule(`${path}.animationFrames`, NO_ACTION_FILE_PLUNGE_ANIMATION_FRAMES);
      addNoActionFileRule(`${path}.hits.0.hitmarkFrames`, 0);
      if (hitbox?.radius !== undefined)
        add(
          `${path}.hits.0.area`,
          createCircleReach(0, hitbox.radius),
          fallbackConfigFile,
          hitbox.line,
          KitProvisionalCause.NoActionFile,
        );
    }
  }
  const collisionHitbox = findGcsimHitbox(plungeSource.config, "plunge", "Plunge");
  if (hasPlungeFile) {
    const collisionHitmark = findGcsimConstant(constantMap, "collisionHitmark");
    addHit(
      "plungeCollision",
      {
        areaHitbox: collisionHitbox,
        attack: attacks.find(({ talentVariable }) => talentVariable === "collision"),
        ...(typeof collisionHitmark?.value === "number" && {
          hitmark: { file: collisionHitmark.file, line: collisionHitmark.line, value: collisionHitmark.value },
        }),
        talentLeaf: findGcsimTalentLeaf(config, "collision", []),
      },
      STRIKE_TARGETING_AREA,
    );
  } else if (collisionHitbox?.radius !== undefined)
    add(
      "plungeCollision.area",
      createCircleReach(0, collisionHitbox.radius),
      fallbackConfigFile,
      collisionHitbox.line,
      KitProvisionalCause.NoActionFile,
    );
};
