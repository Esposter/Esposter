import type { ImageKey } from "@/models/dungeons/keys/ImageKey";
import type { SpritesheetKey } from "@/models/dungeons/keys/SpritesheetKey";

export interface Asset {
  key: ImageKey | SpritesheetKey;
  // By default, this will be 0
  frame?: number;
}
