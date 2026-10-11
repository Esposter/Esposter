import type { GcsimAttack } from "#src/models/genshinAssets/kits/gcsim/GcsimAttack";
import type { GcsimConfig } from "#src/models/genshinAssets/kits/gcsim/GcsimConfig";
import type { GcsimTalentParameter } from "#src/models/genshinAssets/kits/gcsim/GcsimTalentParameter";
import type { GcsimTravel } from "#src/models/genshinAssets/kits/gcsim/GcsimTravel";
import type { GoConstant } from "#src/models/genshinAssets/kits/gcsim/GoConstant";

// What the builder reads of one gcsim character folder at a ref: its folder, its config, its package's constants by
// Name, its `AttackInfo` literals, its talent file's parameters by `<talent>|<label>`, the travel its projectiles land
// After by the hitmark constant they are released at, and the names of its files
export interface GcsimCharacter {
  attacks: GcsimAttack[];
  config: GcsimConfig;
  constantMap: Map<string, GoConstant>;
  fileNames: string[];
  folder: string;
  talentFile: string;
  talentParameterMap: Map<string, GcsimTalentParameter>;
  travelMap: Map<string, GcsimTravel>;
}
