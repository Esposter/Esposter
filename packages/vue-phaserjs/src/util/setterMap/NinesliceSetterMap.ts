import type { NinesliceConfiguration } from "@/models/configuration/NinesliceConfiguration";
import type { NinesliceEventEmitsOptions } from "@/models/emit/NinesliceEventEmitsOptions";
import type { SetterMap } from "@/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { AlphaSingleSetterMap } from "@/util/setterMap/components/AlphaSingleSetterMap";
import { BlendModeSetterMap } from "@/util/setterMap/components/BlendModeSetterMap";
import { ComputedSizeSetterMap } from "@/util/setterMap/components/ComputedSizeSetterMap";
import { DepthSetterMap } from "@/util/setterMap/components/DepthSetterMap";
import { MaskSetterMap } from "@/util/setterMap/components/MaskSetterMap";
import { OriginSetterMap } from "@/util/setterMap/components/OriginSetterMap";
import { RenderNodesSetterMap } from "@/util/setterMap/components/RenderNodesSetterMap";
import { ScrollFactorSetterMap } from "@/util/setterMap/components/ScrollFactorSetterMap";
import { TextureSetterMap } from "@/util/setterMap/components/TextureSetterMap";
import { TransformSetterMap } from "@/util/setterMap/components/TransformSetterMap";
import { VisibleSetterMap } from "@/util/setterMap/components/VisibleSetterMap";
import { GlobalSetterMap } from "@/util/setterMap/global/GlobalSetterMap";

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
