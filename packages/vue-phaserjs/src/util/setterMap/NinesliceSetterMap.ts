import type { NinesliceConfiguration } from "#src/models/configuration/NinesliceConfiguration";
import type { NinesliceEventEmitsOptions } from "#src/models/emit/NinesliceEventEmitsOptions";
import type { SetterMap } from "#src/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { AlphaSingleSetterMap } from "#src/util/setterMap/components/AlphaSingleSetterMap";
import { BlendModeSetterMap } from "#src/util/setterMap/components/BlendModeSetterMap";
import { ComputedSizeSetterMap } from "#src/util/setterMap/components/ComputedSizeSetterMap";
import { DepthSetterMap } from "#src/util/setterMap/components/DepthSetterMap";
import { MaskSetterMap } from "#src/util/setterMap/components/MaskSetterMap";
import { OriginSetterMap } from "#src/util/setterMap/components/OriginSetterMap";
import { RenderNodesSetterMap } from "#src/util/setterMap/components/RenderNodesSetterMap";
import { ScrollFactorSetterMap } from "#src/util/setterMap/components/ScrollFactorSetterMap";
import { TextureSetterMap } from "#src/util/setterMap/components/TextureSetterMap";
import { TransformSetterMap } from "#src/util/setterMap/components/TransformSetterMap";
import { VisibleSetterMap } from "#src/util/setterMap/components/VisibleSetterMap";
import { GlobalSetterMap } from "#src/util/setterMap/global/GlobalSetterMap";

export const NinesliceSetterMap: SetterMap<NinesliceConfiguration, GameObjects.NineSlice, NinesliceEventEmitsOptions> =
  {
    height: ComputedSizeSetterMap.height,
    width: ComputedSizeSetterMap.width,
    ...AlphaSingleSetterMap,
    ...BlendModeSetterMap,
    ...DepthSetterMap,
    ...MaskSetterMap,
    ...OriginSetterMap,
    ...RenderNodesSetterMap,
    ...ScrollFactorSetterMap,
    ...TextureSetterMap,
    ...TransformSetterMap,
    ...VisibleSetterMap,
    ...GlobalSetterMap,
  };
