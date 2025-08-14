import type { NineSliceConfiguration } from "@/models/configuration/NineSliceConfiguration";
import type { NineSliceEventEmitsOptions } from "@/models/emit/NineSliceEventEmitsOptions";
import type { SetterMap } from "@/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { AlphaSingleSetterMap } from "@/util/setterMap/components/AlphaSingleSetterMap";
import { BlendModeSetterMap } from "@/util/setterMap/components/BlendModeSetterMap";
import { DepthSetterMap } from "@/util/setterMap/components/DepthSetterMap";
import { MaskSetterMap } from "@/util/setterMap/components/MaskSetterMap";
import { OriginSetterMap } from "@/util/setterMap/components/OriginSetterMap";
import { RenderNodesSetterMap } from "@/util/setterMap/components/RenderNodesSetterMap";
import { ScrollFactorSetterMap } from "@/util/setterMap/components/ScrollFactorSetterMap";
import { TextureSetterMap } from "@/util/setterMap/components/TextureSetterMap";
import { TransformSetterMap } from "@/util/setterMap/components/TransformSetterMap";
import { VisibleSetterMap } from "@/util/setterMap/components/VisibleSetterMap";
import { GlobalSetterMap } from "@/util/setterMap/global/GlobalSetterMap";

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
    ...RenderNodesSetterMap,
    ...ScrollFactorSetterMap,
    ...TextureSetterMap,
    ...TransformSetterMap,
    ...VisibleSetterMap,
    ...GlobalSetterMap,
  };
