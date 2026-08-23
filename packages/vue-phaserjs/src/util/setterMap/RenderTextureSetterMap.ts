import type { RenderTextureConfiguration } from "#src/models/configuration/RenderTextureConfiguration";
import type { RenderTextureEventEmitsOptions } from "#src/models/emit/RenderTextureEventEmitsOptions";
import type { SetterMap } from "#src/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { AlphaSetterMap } from "#src/util/setterMap/components/AlphaSetterMap";
import { BlendModeSetterMap } from "#src/util/setterMap/components/BlendModeSetterMap";
import { DepthSetterMap } from "#src/util/setterMap/components/DepthSetterMap";
import { FlipSetterMap } from "#src/util/setterMap/components/FlipSetterMap";
import { MaskSetterMap } from "#src/util/setterMap/components/MaskSetterMap";
import { OriginSetterMap } from "#src/util/setterMap/components/OriginSetterMap";
import { RenderNodesSetterMap } from "#src/util/setterMap/components/RenderNodesSetterMap";
import { ScrollFactorSetterMap } from "#src/util/setterMap/components/ScrollFactorSetterMap";
import { SizeSetterMap } from "#src/util/setterMap/components/SizeSetterMap";
import { TintSetterMap } from "#src/util/setterMap/components/TintSetterMap";
import { TransformSetterMap } from "#src/util/setterMap/components/TransformSetterMap";
import { VisibleSetterMap } from "#src/util/setterMap/components/VisibleSetterMap";
import { GlobalSetterMap } from "#src/util/setterMap/global/GlobalSetterMap";

export const RenderTextureSetterMap: SetterMap<
  RenderTextureConfiguration,
  GameObjects.RenderTexture,
  RenderTextureEventEmitsOptions
> = {
  ...AlphaSetterMap,
  ...BlendModeSetterMap,
  ...DepthSetterMap,
  ...FlipSetterMap,
  ...MaskSetterMap,
  ...OriginSetterMap,
  ...RenderNodesSetterMap,
  ...ScrollFactorSetterMap,
  ...SizeSetterMap,
  ...TintSetterMap,
  ...TransformSetterMap,
  ...VisibleSetterMap,
  ...GlobalSetterMap,
};
