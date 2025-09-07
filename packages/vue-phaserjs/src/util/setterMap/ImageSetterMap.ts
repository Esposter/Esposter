import type { ImageConfiguration } from "@/models/configuration/ImageConfiguration";
import type { ImageEventEmitsOptions } from "@/models/emit/ImageEventEmitsOptions";
import type { SetterMap } from "@/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { AlphaSetterMap } from "@/util/setterMap/components/AlphaSetterMap";
import { BlendModeSetterMap } from "@/util/setterMap/components/BlendModeSetterMap";
import { DepthSetterMap } from "@/util/setterMap/components/DepthSetterMap";
import { FlipSetterMap } from "@/util/setterMap/components/FlipSetterMap";
import { MaskSetterMap } from "@/util/setterMap/components/MaskSetterMap";
import { OriginSetterMap } from "@/util/setterMap/components/OriginSetterMap";
import { RenderNodesSetterMap } from "@/util/setterMap/components/RenderNodesSetterMap";
import { ScrollFactorSetterMap } from "@/util/setterMap/components/ScrollFactorSetterMap";
import { SizeSetterMap } from "@/util/setterMap/components/SizeSetterMap";
import { TextureCropSetterMap } from "@/util/setterMap/components/TextureCropSetterMap";
import { TintSetterMap } from "@/util/setterMap/components/TintSetterMap";
import { TransformSetterMap } from "@/util/setterMap/components/TransformSetterMap";
import { VisibleSetterMap } from "@/util/setterMap/components/VisibleSetterMap";
import { GlobalSetterMap } from "@/util/setterMap/global/GlobalSetterMap";

export const ImageSetterMap: SetterMap<ImageConfiguration, GameObjects.Image, ImageEventEmitsOptions> = {
  ...AlphaSetterMap,
  ...BlendModeSetterMap,
  ...DepthSetterMap,
  ...FlipSetterMap,
  ...MaskSetterMap,
  ...OriginSetterMap,
  ...RenderNodesSetterMap,
  ...ScrollFactorSetterMap,
  ...SizeSetterMap,
  ...TextureCropSetterMap,
  ...TintSetterMap,
  ...TransformSetterMap,
  ...VisibleSetterMap,
  ...GlobalSetterMap,
};
