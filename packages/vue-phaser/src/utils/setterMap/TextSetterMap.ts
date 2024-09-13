import type { TextConfiguration } from "@/models/configuration/TextConfiguration";
import type { TextEventEmitsOptions } from "@/models/emit/TextEventEmitsOptions";
import type { SetterMap } from "@/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { AlphaSetterMap } from "@/utils/setterMap/components/AlphaSetterMap";
import { BlendModeSetterMap } from "@/utils/setterMap/components/BlendModeSetterMap";
import { ComputedSizeSetterMap } from "@/utils/setterMap/components/ComputedSizeSetterMap";
import { DepthSetterMap } from "@/utils/setterMap/components/DepthSetterMap";
import { FlipSetterMap } from "@/utils/setterMap/components/FlipSetterMap";
import { MaskSetterMap } from "@/utils/setterMap/components/MaskSetterMap";
import { OriginSetterMap } from "@/utils/setterMap/components/OriginSetterMap";
import { PipelineSetterMap } from "@/utils/setterMap/components/PipelineSetterMap";
import { ScrollFactorSetterMap } from "@/utils/setterMap/components/ScrollFactorSetterMap";
import { TintSetterMap } from "@/utils/setterMap/components/TintSetterMap";
import { TransformSetterMap } from "@/utils/setterMap/components/TransformSetterMap";
import { VisibleSetterMap } from "@/utils/setterMap/components/VisibleSetterMap";
import { GlobalSetterMap } from "@/utils/setterMap/global/GlobalSetterMap";

export const TextSetterMap: SetterMap<TextConfiguration, GameObjects.Text, TextEventEmitsOptions> = {
  padding: (gameObject) => (value) => {
    if (!value) return;
    gameObject.setPadding(value);
  },
  style: (gameObject) => (value) => {
    if (!value) return;
    gameObject.setStyle(value);
  },
  text: (gameObject, emit) => (value) => {
    if (value === undefined) return;
    // Unfortunately, we also have to refresh width values for vue to properly sync up,
    // since it doesn't know that other computed phaser properties have also changed :C
    gameObject.setText(value);
    emit("update:width", gameObject.width);
    emit("update:displayWidth", gameObject.displayWidth);
  },
  ...AlphaSetterMap,
  ...BlendModeSetterMap,
  ...ComputedSizeSetterMap,
  ...DepthSetterMap,
  ...FlipSetterMap,
  ...MaskSetterMap,
  ...OriginSetterMap,
  ...PipelineSetterMap,
  ...ScrollFactorSetterMap,
  ...TintSetterMap,
  ...TransformSetterMap,
  ...VisibleSetterMap,
  ...GlobalSetterMap,
};
