import { WorldForegroundKey } from "@/models/dungeons/keys/image/world/WorldForegroundKey";
import { mergeObjectsStrict } from "@esposter/shared";

export const WorldKey = mergeObjectsStrict(WorldForegroundKey);
export type WorldKey = WorldForegroundKey;
