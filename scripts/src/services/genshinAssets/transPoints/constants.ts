import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { join } from "node:path";

// The scene of the open world in the transport point table. Its points are the statues' and the waypoints' the world holds
export const OPEN_WORLD_SCENE_ID = 3;
// The open world's transport point rewards, the slice the world reads them from in its generated folder
export const TRANS_POINT_REWARDS_PATH: string = join(
  REPOSITORY_ROOT,
  "packages",
  "genshin-world",
  "src",
  "generated",
  "transPoints",
  "scene3.json",
);
