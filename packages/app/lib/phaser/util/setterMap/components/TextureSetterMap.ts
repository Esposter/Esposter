import type { TextureConfiguration } from "@/lib/phaser/models/configuration/components/TextureConfiguration";
import type { TextureEventEmitsOptions } from "@/lib/phaser/models/emit/components/TextureEventEmitsOptions";
import type { SetterMap } from "@/lib/phaser/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { BaseTextureSetterMap } from "@/lib/phaser/util/setterMap/components/BaseTextureSetterMap";

export const TextureSetterMap = {
  ...BaseTextureSetterMap,
} as const satisfies SetterMap<TextureConfiguration, GameObjects.Components.Texture, TextureEventEmitsOptions>;
