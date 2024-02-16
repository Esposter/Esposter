import { type TextConfiguration } from "@/lib/phaser/models/configuration/TextConfiguration";
import { type TextEventEmitsOptions } from "@/lib/phaser/models/emit/TextEventEmitsOptions";
import { type SetterMap } from "@/lib/phaser/models/setterMap/SetterMap";
import { AlphaSetterMap } from "@/lib/phaser/util/setterMap/components/AlphaSetterMap";
import { BlendModeSetterMap } from "@/lib/phaser/util/setterMap/components/BlendModeSetterMap";
import { ComputedSizeSetterMap } from "@/lib/phaser/util/setterMap/components/ComputedSizeSetterMap";
import { DepthSetterMap } from "@/lib/phaser/util/setterMap/components/DepthSetterMap";
import { FlipSetterMap } from "@/lib/phaser/util/setterMap/components/FlipSetterMap";
import { MaskSetterMap } from "@/lib/phaser/util/setterMap/components/MaskSetterMap";
import { OriginSetterMap } from "@/lib/phaser/util/setterMap/components/OriginSetterMap";
import { PipelineSetterMap } from "@/lib/phaser/util/setterMap/components/PipelineSetterMap";
import { ScrollFactorSetterMap } from "@/lib/phaser/util/setterMap/components/ScrollFactorSetterMap";
import { TintSetterMap } from "@/lib/phaser/util/setterMap/components/TintSetterMap";
import { TransformSetterMap } from "@/lib/phaser/util/setterMap/components/TransformSetterMap";
import { VisibleSetterMap } from "@/lib/phaser/util/setterMap/components/VisibleSetterMap";
import { GlobalSetterMap } from "@/lib/phaser/util/setterMap/global/GlobalSetterMap";
import { type GameObjects } from "phaser";

export const TextSetterMap: SetterMap<TextConfiguration, GameObjects.Text, TextEventEmitsOptions> = {
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
};
