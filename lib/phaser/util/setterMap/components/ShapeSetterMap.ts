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
  active: (gameObject) => (value) => gameObject.setActive(value),
  displayWidth: (gameObject) => (value) => gameObject.setDisplaySize(value, gameObject.displayHeight),
  displayHeight: (gameObject) => (value) => gameObject.setDisplaySize(gameObject.displayWidth, value),
  fillColor: (gameObject) => (value) => gameObject.setFillStyle(value, gameObject.alpha),
  fillAlpha: (gameObject) => (value) => gameObject.setFillStyle(gameObject.fillColor, value),
} satisfies SetterMap<GameObjects.Shape, GameObjects.Shape>;
