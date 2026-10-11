import type { TileSpriteConfiguration } from "#src/models/configuration/TileSpriteConfiguration";
import type { TileSpriteEventEmitsOptions } from "#src/models/emit/TileSpriteEventEmitsOptions";
import type { SetterMap } from "#src/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { ComputedSizeSetterMap } from "#src/services/setterMap/components/ComputedSizeSetterMap";
import { FlipSetterMap } from "#src/services/setterMap/components/FlipSetterMap";
import { TextureSetterMap } from "#src/services/setterMap/components/TextureSetterMap";
import { RenderableSetterMap } from "#src/services/setterMap/shared/RenderableSetterMap";

export const TileSpriteSetterMap: SetterMap<
  TileSpriteConfiguration,
  GameObjects.TileSprite,
  TileSpriteEventEmitsOptions
> = { ...RenderableSetterMap, ...ComputedSizeSetterMap, ...FlipSetterMap, ...TextureSetterMap };
