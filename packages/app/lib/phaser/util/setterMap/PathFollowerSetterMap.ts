import type { PathFollowerConfiguration } from "@/lib/phaser/models/configuration/PathFollowerConfiguration";
import type { PathFollowerEventEmitsOptions } from "@/lib/phaser/models/emit/PathFollowerEventEmitsOptions";
import type { SetterMap } from "@/lib/phaser/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { AlphaSetterMap } from "@/lib/phaser/util/setterMap/components/AlphaSetterMap";
import { BlendModeSetterMap } from "@/lib/phaser/util/setterMap/components/BlendModeSetterMap";
import { DepthSetterMap } from "@/lib/phaser/util/setterMap/components/DepthSetterMap";
import { FlipSetterMap } from "@/lib/phaser/util/setterMap/components/FlipSetterMap";
import { MaskSetterMap } from "@/lib/phaser/util/setterMap/components/MaskSetterMap";
import { OriginSetterMap } from "@/lib/phaser/util/setterMap/components/OriginSetterMap";
import { PathFollowerComponentSetterMap } from "@/lib/phaser/util/setterMap/components/PathFollowerComponentSetterMap";
import { PipelineSetterMap } from "@/lib/phaser/util/setterMap/components/PipelineSetterMap";
import { ScrollFactorSetterMap } from "@/lib/phaser/util/setterMap/components/ScrollFactorSetterMap";
import { SizeSetterMap } from "@/lib/phaser/util/setterMap/components/SizeSetterMap";
import { TextureSetterMap } from "@/lib/phaser/util/setterMap/components/TextureSetterMap";
import { TintSetterMap } from "@/lib/phaser/util/setterMap/components/TintSetterMap";
import { TransformSetterMap } from "@/lib/phaser/util/setterMap/components/TransformSetterMap";
import { VisibleSetterMap } from "@/lib/phaser/util/setterMap/components/VisibleSetterMap";
import { GlobalSetterMap } from "@/lib/phaser/util/setterMap/global/GlobalSetterMap";

export const PathFollowerSetterMap: SetterMap<
  PathFollowerConfiguration,
  GameObjects.PathFollower,
  PathFollowerEventEmitsOptions
> = {
  ...AlphaSetterMap,
  ...BlendModeSetterMap,
  ...DepthSetterMap,
  ...FlipSetterMap,
  ...MaskSetterMap,
  ...OriginSetterMap,
  ...PathFollowerComponentSetterMap,
  ...PipelineSetterMap,
  ...ScrollFactorSetterMap,
  ...SizeSetterMap,
  ...TextureSetterMap,
  ...TintSetterMap,
  ...TransformSetterMap,
  ...VisibleSetterMap,
  ...GlobalSetterMap,
};
