import { type ShapeConfiguration } from "@/lib/phaser/models/configuration/global/ShapeConfiguration";
import { type ShapeEventEmitsOptions } from "@/lib/phaser/models/emit/global/ShapeEventEmitsOptions";
import { type SetterMap } from "@/lib/phaser/models/setterMap/SetterMap";
import { AlphaSingleSetterMap } from "@/lib/phaser/util/setterMap/components/AlphaSingleSetterMap";
import { BlendModeSetterMap } from "@/lib/phaser/util/setterMap/components/BlendModeSetterMap";
import { DepthSetterMap } from "@/lib/phaser/util/setterMap/components/DepthSetterMap";
import { MaskSetterMap } from "@/lib/phaser/util/setterMap/components/MaskSetterMap";
import { OriginSetterMap } from "@/lib/phaser/util/setterMap/components/OriginSetterMap";
import { PipelineSetterMap } from "@/lib/phaser/util/setterMap/components/PipelineSetterMap";
import { ScrollFactorSetterMap } from "@/lib/phaser/util/setterMap/components/ScrollFactorSetterMap";
import { TransformSetterMap } from "@/lib/phaser/util/setterMap/components/TransformSetterMap";
import { VisibleSetterMap } from "@/lib/phaser/util/setterMap/components/VisibleSetterMap";
import { type GameObjects } from "phaser";

export const ShapeSetterMap = {
  ...AlphaSingleSetterMap,
  ...BlendModeSetterMap,
  ...DepthSetterMap,
  ...MaskSetterMap,
  ...OriginSetterMap,
  ...PipelineSetterMap,
  ...ScrollFactorSetterMap,
  ...TransformSetterMap,
  ...VisibleSetterMap,
  active: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setActive(value);
  },
  displayWidth: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setDisplaySize(value, gameObject.displayHeight);
  },
  displayHeight: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setDisplaySize(gameObject.displayWidth, value);
  },
  fillColor: (gameObject) => (value) => gameObject.setFillStyle(value, gameObject.alpha),
  fillAlpha: (gameObject) => (value) => gameObject.setFillStyle(gameObject.fillColor, value),
  strokeStyle: (gameObject) => (value) => {
    if (!value) return;
    gameObject.setStrokeStyle(...value);
  },
} satisfies SetterMap<ShapeConfiguration, GameObjects.Shape, ShapeEventEmitsOptions>;
