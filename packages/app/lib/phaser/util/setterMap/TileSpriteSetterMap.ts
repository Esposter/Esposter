import type { TileSpriteConfiguration } from "@/lib/phaser/models/configuration/TileSpriteConfiguration";
import type { TileSpriteEventEmitsOptions } from "@/lib/phaser/models/emit/TileSpriteEventEmitsOptions";
import type { SetterMap } from "@/lib/phaser/models/setterMap/SetterMap";
import { AlphaSetterMap } from "@/lib/phaser/util/setterMap/components/AlphaSetterMap";
import { BlendModeSetterMap } from "@/lib/phaser/util/setterMap/components/BlendModeSetterMap";
import { ComputedSizeSetterMap } from "@/lib/phaser/util/setterMap/components/ComputedSizeSetterMap";
import { DepthSetterMap } from "@/lib/phaser/util/setterMap/components/DepthSetterMap";
import { FlipSetterMap } from "@/lib/phaser/util/setterMap/components/FlipSetterMap";
import { MaskSetterMap } from "@/lib/phaser/util/setterMap/components/MaskSetterMap";
import { OriginSetterMap } from "@/lib/phaser/util/setterMap/components/OriginSetterMap";
import { PipelineSetterMap } from "@/lib/phaser/util/setterMap/components/PipelineSetterMap";
import { ScrollFactorSetterMap } from "@/lib/phaser/util/setterMap/components/ScrollFactorSetterMap";
import { TextureSetterMap } from "@/lib/phaser/util/setterMap/components/TextureSetterMap";
import { TintSetterMap } from "@/lib/phaser/util/setterMap/components/TintSetterMap";
import { TransformSetterMap } from "@/lib/phaser/util/setterMap/components/TransformSetterMap";
import { VisibleSetterMap } from "@/lib/phaser/util/setterMap/components/VisibleSetterMap";
import { GlobalSetterMap } from "@/lib/phaser/util/setterMap/global/GlobalSetterMap";
import type { GameObjects } from "phaser";

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
