import { WorldForegroundKey } from "@/models/dungeons/keys/image/world/WorldForegroundKey";
import { mergeObjectsStrict } from "@/util/mergeObjectsStrict";

export const WorldKey = mergeObjectsStrict(WorldForegroundKey);
export type WorldKey = keyof typeof WorldKey;
