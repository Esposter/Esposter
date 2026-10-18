import type { GcsimAttack } from "#src/models/genshinAssets/kits/gcsim/GcsimAttack";
import type { GcsimConfig } from "#src/models/genshinAssets/kits/gcsim/GcsimConfig";
import type { GcsimHoldCooldown } from "#src/models/genshinAssets/kits/gcsim/GcsimHoldCooldown";
import type { GcsimQueuedAttack } from "#src/models/genshinAssets/kits/gcsim/GcsimQueuedAttack";
import type { GcsimTalentParameter } from "#src/models/genshinAssets/kits/gcsim/GcsimTalentParameter";
import type { GcsimTravel } from "#src/models/genshinAssets/kits/gcsim/GcsimTravel";
import type { GoConstant } from "#src/models/genshinAssets/kits/gcsim/GoConstant";

// What the builder reads of one gcsim character folder at a ref: its folder, its config and the config's path, its
// Package's constants by name, the frames each ability file animates by, its `AttackInfo` literals, its talent file's
// Parameters by `<talent>|<label>`, the travel its projectiles land after by the hitmark constant they are released at,
// Its queue calls, the cooldown each of its skill hold's switch cases gives the skill, and the paths of its files below
// the folder
export interface GcsimCharacter {
  animationFrameNameMap: Map<string, string>;
  attacks: GcsimAttack[];
  config: GcsimConfig;
  configFile: string;
  constantMap: Map<string, GoConstant>;
  filePaths: string[];
  folder: string;
  holdCooldowns: GcsimHoldCooldown[];
  queuedAttacks: GcsimQueuedAttack[];
  talentFile: string;
  talentParameterMap: Map<string, GcsimTalentParameter>;
  travelMap: Map<string, GcsimTravel>;
}
