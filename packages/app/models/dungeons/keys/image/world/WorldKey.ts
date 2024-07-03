import { WorldForegroundKey } from "@/models/dungeons/keys/image/world/WorldForegroundKey";
import { mergeObjectsStrict } from "@/util/object/mergeObjectsStrict";

export const WorldKey = mergeObjectsStrict(WorldForegroundKey);
export type WorldKey = WorldForegroundKey;
