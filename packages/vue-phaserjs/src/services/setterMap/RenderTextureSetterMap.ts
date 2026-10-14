import type { RenderTextureConfiguration } from "#src/models/configuration/RenderTextureConfiguration";
import type { RenderTextureEventEmitsOptions } from "#src/models/emit/RenderTextureEventEmitsOptions";
import type { SetterMap } from "#src/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { AlphaSetterMap } from "#src/services/setterMap/components/AlphaSetterMap";
import { FlipSetterMap } from "#src/services/setterMap/components/FlipSetterMap";
import { OriginSetterMap } from "#src/services/setterMap/components/OriginSetterMap";
import { RenderNodesSetterMap } from "#src/services/setterMap/components/RenderNodesSetterMap";
import { SizeSetterMap } from "#src/services/setterMap/components/SizeSetterMap";
import { TintSetterMap } from "#src/services/setterMap/components/TintSetterMap";
import { GlobalSetterMap } from "#src/services/setterMap/global/GlobalSetterMap";
import { SceneObjectSetterMap } from "#src/services/setterMap/shared/SceneObjectSetterMap";

export const RenderTextureSetterMap: SetterMap<
  RenderTextureConfiguration,
  GameObjects.RenderTexture,
  RenderTextureEventEmitsOptions
> = {
  ...AlphaSetterMap,
  ...SceneObjectSetterMap,
  ...FlipSetterMap,
  ...OriginSetterMap,
  ...RenderNodesSetterMap,
  ...SizeSetterMap,
  ...TintSetterMap,
  ...GlobalSetterMap,
};
