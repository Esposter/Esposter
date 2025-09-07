import type { PathFollowerConfiguration } from "@/models/configuration/PathFollowerConfiguration";
import type { PathFollowerEventEmitsOptions } from "@/models/emit/PathFollowerEventEmitsOptions";
import type { SetterMap } from "@/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { AlphaSetterMap } from "@/util/setterMap/components/AlphaSetterMap";
import { BlendModeSetterMap } from "@/util/setterMap/components/BlendModeSetterMap";
import { DepthSetterMap } from "@/util/setterMap/components/DepthSetterMap";
import { FlipSetterMap } from "@/util/setterMap/components/FlipSetterMap";
import { MaskSetterMap } from "@/util/setterMap/components/MaskSetterMap";
import { OriginSetterMap } from "@/util/setterMap/components/OriginSetterMap";
import { PathFollowerComponentSetterMap } from "@/util/setterMap/components/PathFollowerComponentSetterMap";
import { RenderNodesSetterMap } from "@/util/setterMap/components/RenderNodesSetterMap";
import { ScrollFactorSetterMap } from "@/util/setterMap/components/ScrollFactorSetterMap";
import { SizeSetterMap } from "@/util/setterMap/components/SizeSetterMap";
import { TextureSetterMap } from "@/util/setterMap/components/TextureSetterMap";
import { TintSetterMap } from "@/util/setterMap/components/TintSetterMap";
import { TransformSetterMap } from "@/util/setterMap/components/TransformSetterMap";
import { VisibleSetterMap } from "@/util/setterMap/components/VisibleSetterMap";
import { GlobalSetterMap } from "@/util/setterMap/global/GlobalSetterMap";

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
  ...RenderNodesSetterMap,
  ...ScrollFactorSetterMap,
  ...SizeSetterMap,
  ...TextureSetterMap,
  ...TintSetterMap,
  ...TransformSetterMap,
  ...VisibleSetterMap,
  ...GlobalSetterMap,
};
