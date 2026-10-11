import type { GcsimCharacter } from "#src/models/genshinAssets/kits/gcsim/GcsimCharacter";
import type { GoSource } from "#src/models/genshinAssets/kits/gcsim/GoSource";

import { GCSIM_CONFIG_FILE } from "#src/services/genshinAssets/kits/constants";
import { evaluateGoConstants } from "#src/services/genshinAssets/kits/gcsim/evaluateGoConstants";
import { readGcsimAttacks } from "#src/services/genshinAssets/kits/gcsim/readGcsimAttacks";
import { readGcsimConfig } from "#src/services/genshinAssets/kits/gcsim/readGcsimConfig";
import { readGcsimTalentParameters } from "#src/services/genshinAssets/kits/gcsim/readGcsimTalentParameters";
import { readGcsimTravels } from "#src/services/genshinAssets/kits/gcsim/readGcsimTravels";

const TALENT_FILE_PREFIX = "zz_";

// One gcsim character folder as the builder reads it, from its files by name: the config, the package's constants and
// `AttackInfo` literals and projectile travels over every Go file but the generated talent file and the tests, and the
// Talent file's labels
export const readGcsimCharacter = (folder: string, fileMap: ReadonlyMap<string, string>): GcsimCharacter => {
  const goSources: GoSource[] = [...fileMap]
    .filter(([name]) => name.endsWith(".go") && !name.endsWith("_test.go") && !name.startsWith(TALENT_FILE_PREFIX))
    .map(([name, source]) => ({ name, source }));
  const constantMap = evaluateGoConstants(goSources);
  const [talentFile = "", talentSource = ""] =
    [...fileMap].find(([name]) => name.startsWith(TALENT_FILE_PREFIX) && name.endsWith(".go")) ?? [];
  return {
    attacks: readGcsimAttacks(goSources, constantMap),
    config: readGcsimConfig(fileMap.get(GCSIM_CONFIG_FILE) ?? ""),
    constantMap,
    fileNames: [...fileMap.keys()],
    folder,
    talentFile,
    talentParameterMap: readGcsimTalentParameters(talentSource),
    travelMap: readGcsimTravels(goSources),
  };
};
