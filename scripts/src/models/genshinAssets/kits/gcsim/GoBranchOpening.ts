import type { GoBranchPlace } from "#src/models/genshinAssets/kits/gcsim/GoBranchPlace";
import type { GoSwitchFrame } from "#src/models/genshinAssets/kits/gcsim/GoSwitchFrame";

export interface GoBranchOpening {
  branch?: GoBranchPlace;
  openPosition: number;
  switchFrame?: GoSwitchFrame;
}
