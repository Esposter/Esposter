import type { SpriteConfiguration } from "#src/models/configuration/SpriteConfiguration";
import type { SpriteEventEmitsOptions } from "#src/models/emit/SpriteEventEmitsOptions";
import type { SetterMap } from "#src/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { AlphaSetterMap } from "#src/services/setterMap/components/AlphaSetterMap";
import { FlipSetterMap } from "#src/services/setterMap/components/FlipSetterMap";
import { OriginSetterMap } from "#src/services/setterMap/components/OriginSetterMap";
import { RenderNodesSetterMap } from "#src/services/setterMap/components/RenderNodesSetterMap";
import { SizeSetterMap } from "#src/services/setterMap/components/SizeSetterMap";
import { TextureSetterMap } from "#src/services/setterMap/components/TextureSetterMap";
import { TintSetterMap } from "#src/services/setterMap/components/TintSetterMap";
import { GlobalSetterMap } from "#src/services/setterMap/global/GlobalSetterMap";
import { AnimationSetterMap } from "#src/services/setterMap/shared/AnimationSetterMap";
import { SceneObjectSetterMap } from "#src/services/setterMap/shared/SceneObjectSetterMap";

export const SpriteSetterMap: SetterMap<SpriteConfiguration, GameObjects.Sprite, SpriteEventEmitsOptions> = {
  ...AlphaSetterMap,
  ...SceneObjectSetterMap,
  ...FlipSetterMap,
  ...OriginSetterMap,
  ...RenderNodesSetterMap,
  ...SizeSetterMap,
  ...TextureSetterMap,
  ...TintSetterMap,
  ...AnimationSetterMap,
  ...GlobalSetterMap,
};
