import type { ImageConfiguration } from "#src/models/configuration/ImageConfiguration";
import type { ImageEventEmitsOptions } from "#src/models/emit/ImageEventEmitsOptions";
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
import { TextureCropSetterMap } from "#src/util/setterMap/components/TextureCropSetterMap";
import { TintSetterMap } from "#src/util/setterMap/components/TintSetterMap";
import { TransformSetterMap } from "#src/util/setterMap/components/TransformSetterMap";
import { VisibleSetterMap } from "#src/util/setterMap/components/VisibleSetterMap";
import { GlobalSetterMap } from "#src/util/setterMap/global/GlobalSetterMap";

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
