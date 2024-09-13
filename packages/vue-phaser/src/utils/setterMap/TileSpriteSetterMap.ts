import type { TileSpriteConfiguration } from "@/models/configuration/TileSpriteConfiguration";
import type { TileSpriteEventEmitsOptions } from "@/models/emit/TileSpriteEventEmitsOptions";
import type { SetterMap } from "@/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { AlphaSetterMap } from "@/utils/setterMap/components/AlphaSetterMap";
import { BlendModeSetterMap } from "@/utils/setterMap/components/BlendModeSetterMap";
import { ComputedSizeSetterMap } from "@/utils/setterMap/components/ComputedSizeSetterMap";
import { DepthSetterMap } from "@/utils/setterMap/components/DepthSetterMap";
import { FlipSetterMap } from "@/utils/setterMap/components/FlipSetterMap";
import { MaskSetterMap } from "@/utils/setterMap/components/MaskSetterMap";
import { OriginSetterMap } from "@/utils/setterMap/components/OriginSetterMap";
import { PipelineSetterMap } from "@/utils/setterMap/components/PipelineSetterMap";
import { ScrollFactorSetterMap } from "@/utils/setterMap/components/ScrollFactorSetterMap";
import { TextureSetterMap } from "@/utils/setterMap/components/TextureSetterMap";
import { TintSetterMap } from "@/utils/setterMap/components/TintSetterMap";
import { TransformSetterMap } from "@/utils/setterMap/components/TransformSetterMap";
import { VisibleSetterMap } from "@/utils/setterMap/components/VisibleSetterMap";
import { GlobalSetterMap } from "@/utils/setterMap/global/GlobalSetterMap";

export const TileSpriteSetterMap: SetterMap<
  TileSpriteConfiguration,
  GameObjects.TileSprite,
  TileSpriteEventEmitsOptions
> = {
  ...AlphaSetterMap,
  ...BlendModeSetterMap,
  ...ComputedSizeSetterMap,
  ...DepthSetterMap,
  ...FlipSetterMap,
  ...MaskSetterMap,
  ...OriginSetterMap,
  ...PipelineSetterMap,
  ...ScrollFactorSetterMap,
  ...TextureSetterMap,
  ...TintSetterMap,
  ...TransformSetterMap,
  ...VisibleSetterMap,
  ...GlobalSetterMap,
};
