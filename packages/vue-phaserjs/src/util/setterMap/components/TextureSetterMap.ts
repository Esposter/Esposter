import type { TextureConfiguration } from "@/models/configuration/components/TextureConfiguration";
import type { TextureEventEmitsOptions } from "@/models/emit/components/TextureEventEmitsOptions";
import type { SetterMap } from "@/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { BaseTextureSetterMap } from "@/util/setterMap/components/BaseTextureSetterMap";

export const TextureSetterMap = {
  ...BaseTextureSetterMap,
} as const satisfies SetterMap<TextureConfiguration, GameObjects.Components.Texture, TextureEventEmitsOptions>;
