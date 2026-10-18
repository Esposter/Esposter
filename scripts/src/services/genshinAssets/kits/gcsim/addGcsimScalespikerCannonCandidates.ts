import type { GcsimCharacter } from "#src/models/genshinAssets/kits/gcsim/GcsimCharacter";
import type { GcsimKitCandidateWriter } from "#src/models/genshinAssets/kits/gcsim/GcsimKitCandidateWriter";

import { GcsimHitboxCenter } from "#src/models/genshinAssets/kits/gcsim/GcsimHitboxCenter";
import { GcsimHitboxShape } from "#src/models/genshinAssets/kits/gcsim/GcsimHitboxShape";
import { findGcsimConstant } from "#src/services/genshinAssets/kits/gcsim/findGcsimConstant";
import { findGcsimTalentLeaf } from "#src/services/genshinAssets/kits/gcsim/findGcsimTalentLeaf";
import { readGoNumber } from "#src/services/genshinAssets/kits/gcsim/readGoNumber";
import { SKILL_TARGETING_AREA } from "genshin-world";

const CANNON_PATH = "stances.blessing.skill";
// The frames the Cannon's animation lasts to its cancel into a normal attack: the tap's release, and the attack's 24 frames
// After it (skill.go line 43, `59 - scalespikerReleases[0]`), which gcsim gives as the literal 59
const CANNON_ANIMATION_FRAMES = 59;
const CANNON_ANIMATION_LINE = 43;
// The Cannon's circle of radius three on the primary target, as skill.go's `radius := 3.0` gives it (line 139). Its
// Constellation 2 widens the circle, which the kit does not build
const CANNON_RADIUS = 3;
const CANNON_RADIUS_LINE = 139;

// Kinich's Scalespiker Cannon, the blessing's skill: a tap's one hit on the circle round the primary target. Its hitmark is
// The tap's release, then the frame the points are spent on, then the travel the shot spends landing, as skill.go queues it
export const addGcsimScalespikerCannonCandidates = (
  { add, addHit, toFile }: GcsimKitCandidateWriter,
  { attacks, config, constantMap }: GcsimCharacter,
): void => {
  const releases = findGcsimConstant(constantMap, "scalespikerReleases");
  const pointsDelay = readGoNumber(findGcsimConstant(constantMap, "pointsConsumptionsDelay")?.value);
  const travel = readGoNumber(findGcsimConstant(constantMap, "scalespikerDefaultTravel")?.value);
  const releaseValues = releases?.value;
  const tapRelease = Array.isArray(releaseValues) ? readGoNumber(releaseValues[0]) : undefined;
  const attack = attacks.find(({ talentVariable }) => talentVariable === "scalespikerCannon");
  if (
    releases === undefined ||
    tapRelease === undefined ||
    pointsDelay === undefined ||
    travel === undefined ||
    attack === undefined
  )
    return;
  const file = toFile(releases.file);
  add(`${CANNON_PATH}.animationFrames`, CANNON_ANIMATION_FRAMES, file, CANNON_ANIMATION_LINE);
  add(`${CANNON_PATH}.hits.length`, 1, file, releases.line);
  addHit(
    `${CANNON_PATH}.hits.0`,
    {
      areaHitbox: {
        center: GcsimHitboxCenter.PrimaryTarget,
        file: "skill.go",
        line: CANNON_RADIUS_LINE,
        name: "scalespikerCannon",
        radius: CANNON_RADIUS,
        shape: GcsimHitboxShape.Circle,
      },
      attack,
      hitmark: { file: releases.file, line: releases.line, value: tapRelease + pointsDelay + travel },
      talentLeaf: findGcsimTalentLeaf(config, "scalespikerCannon", [1]),
    },
    SKILL_TARGETING_AREA,
  );
};
