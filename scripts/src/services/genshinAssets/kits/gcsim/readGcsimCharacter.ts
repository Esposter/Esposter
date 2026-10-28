import type { GcsimCharacter } from "#src/models/genshinAssets/kits/gcsim/GcsimCharacter";
import type { GoSource } from "#src/models/genshinAssets/kits/gcsim/GoSource";

import { GCSIM_CONFIG_FILE } from "#src/services/genshinAssets/kits/constants";
import { evaluateGoConstants } from "#src/services/genshinAssets/kits/gcsim/evaluateGoConstants";
import { readGcsimAnimationFrameNames } from "#src/services/genshinAssets/kits/gcsim/readGcsimAnimationFrameNames";
import { readGcsimAttacks } from "#src/services/genshinAssets/kits/gcsim/readGcsimAttacks";
import { readGcsimConfig } from "#src/services/genshinAssets/kits/gcsim/readGcsimConfig";
import { readGcsimHoldCooldowns } from "#src/services/genshinAssets/kits/gcsim/readGcsimHoldCooldowns";
import { readGcsimQueuedAttacks } from "#src/services/genshinAssets/kits/gcsim/readGcsimQueuedAttacks";
import { readGcsimTalentArrays } from "#src/services/genshinAssets/kits/gcsim/readGcsimTalentArrays";
import { readGcsimTalentParameters } from "#src/services/genshinAssets/kits/gcsim/readGcsimTalentParameters";
import { readGcsimTravels } from "#src/services/genshinAssets/kits/gcsim/readGcsimTravels";
import { selectGcsimGenderConstants } from "#src/services/genshinAssets/kits/gcsim/selectGcsimGenderConstants";
import { posix } from "node:path";

const TALENT_FILE_PREFIX = "zz_";

// One gcsim character folder as the builder reads it, from its files by their paths below it: the config, the
// Package's constants at the form's gender and `AttackInfo` literals and projectile travels over every Go file but the
// Generated talent file and the tests, and the talent file's labels
export const readGcsimCharacter = (folder: string, fileMap: ReadonlyMap<string, string>): GcsimCharacter => {
  const goSources: GoSource[] = [...fileMap]
    .filter(([path]) => {
      const name = posix.basename(path);
      return name.endsWith(".go") && !name.endsWith("_test.go") && !name.startsWith(TALENT_FILE_PREFIX);
    })
    .map(([path, source]) => ({ path, source }));
  const constantMap = selectGcsimGenderConstants(goSources, evaluateGoConstants(goSources));
  const [talentFile = "", talentSource = ""] =
    [...fileMap].find(([path]) => posix.basename(path).startsWith(TALENT_FILE_PREFIX) && path.endsWith(".go")) ?? [];
  const [configFile = GCSIM_CONFIG_FILE, configSource = ""] =
    [...fileMap].find(([path]) => posix.basename(path) === GCSIM_CONFIG_FILE) ?? [];
  const config = readGcsimConfig(configSource);
  return {
    animationFrameNameMap: readGcsimAnimationFrameNames(goSources),
    // An attack whose cooldown tag is neither none nor a qualified tag takes it at runtime, as Sayu's absorb hit takes the
    // element she absorbed or a parameter passes it in, so no one tag is its own and it is no static kit hit
    attacks: readGcsimAttacks(goSources, constantMap, config).filter(
      ({ internalCooldownTag }) =>
        internalCooldownTag === undefined || internalCooldownTag.startsWith("attacks.ICDTag"),
    ),
    config,
    configFile,
    constantMap,
    filePaths: [...fileMap.keys()],
    folder,
    goSources,
    holdCooldowns: readGcsimHoldCooldowns(goSources, constantMap),
    queuedAttacks: readGcsimQueuedAttacks(goSources, constantMap, config),
    talentArrayMap: readGcsimTalentArrays(talentSource),
    talentFile,
    talentParameterMap: readGcsimTalentParameters(talentSource),
    travelMap: readGcsimTravels(goSources),
  };
};
