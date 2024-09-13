import type { PathFollowerConfiguration } from "@/models/configuration/PathFollowerConfiguration";
import type { PathFollowerEventEmitsOptions } from "@/models/emit/PathFollowerEventEmitsOptions";
import type { SetterMap } from "@/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { AlphaSetterMap } from "@/utils/setterMap/components/AlphaSetterMap";
import { BlendModeSetterMap } from "@/utils/setterMap/components/BlendModeSetterMap";
import { DepthSetterMap } from "@/utils/setterMap/components/DepthSetterMap";
import { FlipSetterMap } from "@/utils/setterMap/components/FlipSetterMap";
import { MaskSetterMap } from "@/utils/setterMap/components/MaskSetterMap";
import { OriginSetterMap } from "@/utils/setterMap/components/OriginSetterMap";
import { PathFollowerComponentSetterMap } from "@/utils/setterMap/components/PathFollowerComponentSetterMap";
import { PipelineSetterMap } from "@/utils/setterMap/components/PipelineSetterMap";
import { ScrollFactorSetterMap } from "@/utils/setterMap/components/ScrollFactorSetterMap";
import { SizeSetterMap } from "@/utils/setterMap/components/SizeSetterMap";
import { TextureSetterMap } from "@/utils/setterMap/components/TextureSetterMap";
import { TintSetterMap } from "@/utils/setterMap/components/TintSetterMap";
import { TransformSetterMap } from "@/utils/setterMap/components/TransformSetterMap";
import { VisibleSetterMap } from "@/utils/setterMap/components/VisibleSetterMap";
import { GlobalSetterMap } from "@/utils/setterMap/global/GlobalSetterMap";

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
