import type { SpritesheetKey } from "#shared/models/dungeons/keys/spritesheet/SpritesheetKey";

export interface Asset {
  frame?: number;
  key: SpritesheetKey;
}
