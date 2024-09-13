import type { NineSliceConfiguration } from "@/models/configuration/NineSliceConfiguration";
import type { NineSliceEventEmitsOptions } from "@/models/emit/NineSliceEventEmitsOptions";
import type { SetterMap } from "@/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { AlphaSingleSetterMap } from "@/utils/setterMap/components/AlphaSingleSetterMap";
import { BlendModeSetterMap } from "@/utils/setterMap/components/BlendModeSetterMap";
import { DepthSetterMap } from "@/utils/setterMap/components/DepthSetterMap";
import { MaskSetterMap } from "@/utils/setterMap/components/MaskSetterMap";
import { OriginSetterMap } from "@/utils/setterMap/components/OriginSetterMap";
import { PipelineSetterMap } from "@/utils/setterMap/components/PipelineSetterMap";
import { ScrollFactorSetterMap } from "@/utils/setterMap/components/ScrollFactorSetterMap";
import { TextureSetterMap } from "@/utils/setterMap/components/TextureSetterMap";
import { TransformSetterMap } from "@/utils/setterMap/components/TransformSetterMap";
import { VisibleSetterMap } from "@/utils/setterMap/components/VisibleSetterMap";
import { GlobalSetterMap } from "@/utils/setterMap/global/GlobalSetterMap";

export const NineSliceSetterMap: SetterMap<NineSliceConfiguration, GameObjects.NineSlice, NineSliceEventEmitsOptions> =
  {
    height: (gameObject) => (value) => {
      if (value === undefined) return;
      gameObject.setSize(gameObject.width, value);
    },
    width: (gameObject) => (value) => {
      if (value === undefined) return;
      gameObject.setSize(value, gameObject.height);
    },
    ...AlphaSingleSetterMap,
    ...BlendModeSetterMap,
    ...DepthSetterMap,
    ...MaskSetterMap,
    ...OriginSetterMap,
    ...PipelineSetterMap,
    ...ScrollFactorSetterMap,
    ...TextureSetterMap,
    ...TransformSetterMap,
    ...VisibleSetterMap,
    ...GlobalSetterMap,
  };
