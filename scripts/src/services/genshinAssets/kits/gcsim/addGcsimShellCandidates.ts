import type { GcsimCharacter } from "#src/models/genshinAssets/kits/gcsim/GcsimCharacter";
import type { GcsimHitbox } from "#src/models/genshinAssets/kits/gcsim/GcsimHitbox";
import type { GcsimKitCandidateWriter } from "#src/models/genshinAssets/kits/gcsim/GcsimKitCandidateWriter";

import { GcsimHitboxCenter } from "#src/models/genshinAssets/kits/gcsim/GcsimHitboxCenter";
import { GcsimHitboxShape } from "#src/models/genshinAssets/kits/gcsim/GcsimHitboxShape";
import { GCSIM_DURABILITY_PER_GAUGE } from "#src/services/genshinAssets/kits/constants";
import { findGcsimConstant } from "#src/services/genshinAssets/kits/gcsim/findGcsimConstant";
import { findGcsimTalentLeaf } from "#src/services/genshinAssets/kits/gcsim/findGcsimTalentLeaf";
import { toGoNumbers } from "#src/services/genshinAssets/kits/gcsim/toGoNumbers";
import { SKILL_TARGETING_AREA } from "genshin-world";

// The six-metre circle on the primary target that the burst's shells take their targets from, its radius as the burst's
// Literal gives it
const SHELL_RADIUS = 6;
// The line the burst sets a shell's ICD tag on, which its galesplitting literal does not carry
const SHELL_ICD_LINE = 63;
const SHELL_ICD_TAG = "attacks.ICDTagChascaBurst";

// The burst's six shells: the hitmark each is cast at, as the frames list `shellHitmarks`, and the one hit each Soulseeker
// Shell and each Radiant shell plays, its multiplier from the talent variable of its name. A Radiant shell's element is
// Its party's, so its template leaves the element to its behaviour and keeps the gauge the galesplitting literal gives
export const addGcsimShellCandidates = (
  { add, addHit, toFile }: GcsimKitCandidateWriter,
  { attacks, config, constantMap }: GcsimCharacter,
): void => {
  const hitmarks = findGcsimConstant(constantMap, "burstSecondaryHitmark");
  const galesplitting = attacks.find(({ talentVariable }) => talentVariable === "burstGalesplitting");
  const shellHitmarks = toGoNumbers(hitmarks?.value);
  if (hitmarks === undefined || galesplitting === undefined || shellHitmarks === undefined) return;
  add("frames.shellHitmarks.length", shellHitmarks.length, toFile(hitmarks.file), hitmarks.line);
  for (const [shellIndex, hitmark] of shellHitmarks.entries())
    add(
      `frames.shellHitmarks.${shellIndex}`,
      hitmark,
      toFile(hitmarks.file),
      hitmarks.elementLines[shellIndex] ?? hitmarks.line,
    );
  const [firstHitmark] = shellHitmarks;
  if (firstHitmark === undefined) return;
  const areaHitbox: GcsimHitbox = {
    center: GcsimHitboxCenter.PrimaryTarget,
    file: galesplitting.file,
    line: galesplitting.line,
    name: "shell",
    radius: SHELL_RADIUS,
    shape: GcsimHitboxShape.Circle,
  };
  const hitmark = { file: hitmarks.file, line: hitmarks.elementLines[0] ?? hitmarks.line, value: firstHitmark };
  const attack = {
    ...galesplitting,
    fieldLineMap: { ...galesplitting.fieldLineMap, ICDTag: SHELL_ICD_LINE },
    internalCooldownTag: SHELL_ICD_TAG,
  };
  addHit(
    "hits.soulseekerShell",
    { areaHitbox, attack, hitmark, talentLeaf: findGcsimTalentLeaf(config, "burstSoulseeker", []) },
    SKILL_TARGETING_AREA,
  );
  addHit(
    "hits.radiantShell",
    {
      areaHitbox,
      attack: { ...attack, element: undefined },
      hitmark,
      talentLeaf: findGcsimTalentLeaf(config, "burstRadiant", []),
    },
    SKILL_TARGETING_AREA,
  );
  if (galesplitting.durability !== undefined)
    add(
      "hits.radiantShell.gauge",
      galesplitting.durability / GCSIM_DURABILITY_PER_GAUGE,
      toFile(galesplitting.file),
      galesplitting.fieldLineMap.Durability ?? galesplitting.line,
    );
};
