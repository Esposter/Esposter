import type { SpriteConfiguration } from "@/models/configuration/SpriteConfiguration";
import type { SpriteEventEmitsOptions } from "@/models/emit/SpriteEventEmitsOptions";
import type { SetterMap } from "@/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { AlphaSetterMap } from "@/util/setterMap/components/AlphaSetterMap";
import { BlendModeSetterMap } from "@/util/setterMap/components/BlendModeSetterMap";
import { DepthSetterMap } from "@/util/setterMap/components/DepthSetterMap";
import { FlipSetterMap } from "@/util/setterMap/components/FlipSetterMap";
import { MaskSetterMap } from "@/util/setterMap/components/MaskSetterMap";
import { OriginSetterMap } from "@/util/setterMap/components/OriginSetterMap";
import { PipelineSetterMap } from "@/util/setterMap/components/PipelineSetterMap";
import { ScrollFactorSetterMap } from "@/util/setterMap/components/ScrollFactorSetterMap";
import { SizeSetterMap } from "@/util/setterMap/components/SizeSetterMap";
import { TextureSetterMap } from "@/util/setterMap/components/TextureSetterMap";
import { TintSetterMap } from "@/util/setterMap/components/TintSetterMap";
import { TransformSetterMap } from "@/util/setterMap/components/TransformSetterMap";
import { VisibleSetterMap } from "@/util/setterMap/components/VisibleSetterMap";
import { GlobalSetterMap } from "@/util/setterMap/global/GlobalSetterMap";
import { AnimationSetterMap } from "@/util/setterMap/shared/AnimationSetterMap";

export const SpriteSetterMap: SetterMap<SpriteConfiguration, GameObjects.Sprite, SpriteEventEmitsOptions> = {
  ...AlphaSetterMap,
  ...BlendModeSetterMap,
  ...DepthSetterMap,
  ...FlipSetterMap,
  ...MaskSetterMap,
  ...OriginSetterMap,
  ...PipelineSetterMap,
  ...ScrollFactorSetterMap,
  ...SizeSetterMap,
  ...TextureSetterMap,
  ...TintSetterMap,
  ...TransformSetterMap,
  ...VisibleSetterMap,
  ...AnimationSetterMap,
  ...GlobalSetterMap,
};
