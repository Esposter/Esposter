import type { GoBranchPlace } from "#src/models/genshinAssets/kits/gcsim/GoBranchPlace";
import type { GoSwitchFrame } from "#src/models/genshinAssets/kits/gcsim/GoSwitchFrame";

export interface GoBranchOpening {
  branch?: GoBranchPlace | undefined;
  openPosition: number;
  switchFrame?: GoSwitchFrame | undefined;
}
