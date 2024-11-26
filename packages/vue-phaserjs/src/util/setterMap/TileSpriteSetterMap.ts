import type { TileSpriteConfiguration } from "@/models/configuration/TileSpriteConfiguration";
import type { TileSpriteEventEmitsOptions } from "@/models/emit/TileSpriteEventEmitsOptions";
import type { SetterMap } from "@/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { AlphaSetterMap } from "@/util/setterMap/components/AlphaSetterMap";
import { BlendModeSetterMap } from "@/util/setterMap/components/BlendModeSetterMap";
import { ComputedSizeSetterMap } from "@/util/setterMap/components/ComputedSizeSetterMap";
import { DepthSetterMap } from "@/util/setterMap/components/DepthSetterMap";
import { FlipSetterMap } from "@/util/setterMap/components/FlipSetterMap";
import { MaskSetterMap } from "@/util/setterMap/components/MaskSetterMap";
import { OriginSetterMap } from "@/util/setterMap/components/OriginSetterMap";
import { PipelineSetterMap } from "@/util/setterMap/components/PipelineSetterMap";
import { ScrollFactorSetterMap } from "@/util/setterMap/components/ScrollFactorSetterMap";
import { TextureSetterMap } from "@/util/setterMap/components/TextureSetterMap";
import { TintSetterMap } from "@/util/setterMap/components/TintSetterMap";
import { TransformSetterMap } from "@/util/setterMap/components/TransformSetterMap";
import { VisibleSetterMap } from "@/util/setterMap/components/VisibleSetterMap";
import { GlobalSetterMap } from "@/util/setterMap/global/GlobalSetterMap";

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
