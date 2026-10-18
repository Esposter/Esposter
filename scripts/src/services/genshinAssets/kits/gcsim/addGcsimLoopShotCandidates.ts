import type { GcsimCharacter } from "#src/models/genshinAssets/kits/gcsim/GcsimCharacter";
import type { GcsimKitCandidateWriter } from "#src/models/genshinAssets/kits/gcsim/GcsimKitCandidateWriter";

import { GcsimHitboxCenter } from "#src/models/genshinAssets/kits/gcsim/GcsimHitboxCenter";
import { GcsimHitboxShape } from "#src/models/genshinAssets/kits/gcsim/GcsimHitboxShape";
import { addGcsimHitmarkHits } from "#src/services/genshinAssets/kits/gcsim/addGcsimHitmarkHits";
import { findGcsimConstant } from "#src/services/genshinAssets/kits/gcsim/findGcsimConstant";
import { findGcsimTalentLeaf } from "#src/services/genshinAssets/kits/gcsim/findGcsimTalentLeaf";
import { readGoNumber } from "#src/services/genshinAssets/kits/gcsim/readGoNumber";
import { STRIKE_TARGETING_AREA } from "genshin-world";

const LOOP_SHOT_PATH = "stances.blessing.normalAttacks";
// Each Loop Shot's animation, the frames its cancel slice is read at on its action's line (attack.go lines 57 and 65),
// Which gcsim gives as the literal 53 inside a call rather than as a constant
const LOOP_SHOT_ANIMATION_FRAMES = 53;
const LOOP_SHOT_ANIMATION_LINES = [57, 65];
// The Loop Shot's circle of radius 0.5 on the player, as gcsim's NewCircleHit gives it (attack.go line 131)
const LOOP_SHOT_RADIUS = 0.5;
const LOOP_SHOT_RADIUS_LINE = 131;

// Kinich's blessing Loop Shots: each of its two actions is two hits, at the hitmarks of its place in the constant's
// Strings, on the circle round the player, with the skill's multiplier and the Loop Shot's attack. Its strings are the
// Skill's hit count of actions, as gcsim's skillHitNum gives them (attack.go line 35)
export const addGcsimLoopShotCandidates = (writer: GcsimKitCandidateWriter, gcsim: GcsimCharacter): void => {
  const { add, toFile } = writer;
  const { attacks, config, constantMap } = gcsim;
  const actionCount = findGcsimConstant(constantMap, "skillHitNum");
  const hitmarks = findGcsimConstant(constantMap, "skillAttackHitmarks");
  const attack = attacks.find(({ talentVariable }) => talentVariable === "loopShot");
  if (
    actionCount === undefined ||
    hitmarks === undefined ||
    attack === undefined ||
    !Array.isArray(hitmarks.value) ||
    readGoNumber(actionCount.value) === undefined
  )
    return;
  const file = toFile(hitmarks.file);
  add(`${LOOP_SHOT_PATH}.length`, readGoNumber(actionCount.value), file, actionCount.line);
  for (const [actionIndex, actionHitmarks] of hitmarks.value.entries()) {
    if (!Array.isArray(actionHitmarks)) continue;
    const actionPath = `${LOOP_SHOT_PATH}.${actionIndex}`;
    add(
      `${actionPath}.animationFrames`,
      LOOP_SHOT_ANIMATION_FRAMES,
      file,
      LOOP_SHOT_ANIMATION_LINES[actionIndex] ?? hitmarks.line,
    );
    addGcsimHitmarkHits(writer, gcsim, {
      hitmarks: {
        file: hitmarks.file,
        line: hitmarks.line,
        name: hitmarks.name,
        values: actionHitmarks.map((hitmark) => readGoNumber(hitmark)),
      },
      path: actionPath,
      readHit: () => ({
        areaHitbox: {
          center: GcsimHitboxCenter.Player,
          file: "attack.go",
          line: LOOP_SHOT_RADIUS_LINE,
          name: "loopShot",
          radius: LOOP_SHOT_RADIUS,
          shape: GcsimHitboxShape.Circle,
        },
        attack,
        talentLeaf: findGcsimTalentLeaf(config, "loopShot", [0]),
      }),
      targetingArea: STRIKE_TARGETING_AREA,
    });
  }
};
