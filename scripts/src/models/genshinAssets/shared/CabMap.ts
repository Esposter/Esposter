import type { CabMapRecord } from "#src/models/genshinAssets/shared/CabMapRecord";

// AnimeStudio's CAB map as it is serialized: the folder every block in it is relative to, then one record a CAB
export interface CabMap {
  baseFolder: string;
  records: CabMapRecord[];
}
