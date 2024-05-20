import type { NineSliceConfiguration } from "@/lib/phaser/models/configuration/NineSliceConfiguration";
import type { NineSliceEventEmitsOptions } from "@/lib/phaser/models/emit/NineSliceEventEmitsOptions";
import type { SetterMap } from "@/lib/phaser/models/setterMap/SetterMap";
import { AlphaSingleSetterMap } from "@/lib/phaser/util/setterMap/components/AlphaSingleSetterMap";
import { BlendModeSetterMap } from "@/lib/phaser/util/setterMap/components/BlendModeSetterMap";
import { DepthSetterMap } from "@/lib/phaser/util/setterMap/components/DepthSetterMap";
import { MaskSetterMap } from "@/lib/phaser/util/setterMap/components/MaskSetterMap";
import { OriginSetterMap } from "@/lib/phaser/util/setterMap/components/OriginSetterMap";
import { PipelineSetterMap } from "@/lib/phaser/util/setterMap/components/PipelineSetterMap";
import { ScrollFactorSetterMap } from "@/lib/phaser/util/setterMap/components/ScrollFactorSetterMap";
import { TextureSetterMap } from "@/lib/phaser/util/setterMap/components/TextureSetterMap";
import { TransformSetterMap } from "@/lib/phaser/util/setterMap/components/TransformSetterMap";
import { VisibleSetterMap } from "@/lib/phaser/util/setterMap/components/VisibleSetterMap";
import { GlobalSetterMap } from "@/lib/phaser/util/setterMap/global/GlobalSetterMap";
import type { GameObjects } from "phaser";

export const NineSliceSetterMap: SetterMap<NineSliceConfiguration, GameObjects.NineSlice, NineSliceEventEmitsOptions> =
  {
    width: (gameObject) => (value) => {
      if (value === undefined) return;
      gameObject.setSize(value, gameObject.height);
    },
    height: (gameObject) => (value) => {
      if (value === undefined) return;
      gameObject.setSize(gameObject.width, value);
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
