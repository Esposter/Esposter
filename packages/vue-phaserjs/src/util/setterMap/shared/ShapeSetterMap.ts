import type { ShapeConfiguration } from "@/models/configuration/shared/ShapeConfiguration";
import type { ShapeEventEmitsOptions } from "@/models/emit/shared/ShapeEventEmitsOptions";
import type { SetterMap } from "@/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { AlphaSingleSetterMap } from "@/util/setterMap/components/AlphaSingleSetterMap";
import { BlendModeSetterMap } from "@/util/setterMap/components/BlendModeSetterMap";
import { DepthSetterMap } from "@/util/setterMap/components/DepthSetterMap";
import { MaskSetterMap } from "@/util/setterMap/components/MaskSetterMap";
import { OriginSetterMap } from "@/util/setterMap/components/OriginSetterMap";
import { PipelineSetterMap } from "@/util/setterMap/components/PipelineSetterMap";
import { ScrollFactorSetterMap } from "@/util/setterMap/components/ScrollFactorSetterMap";
import { TransformSetterMap } from "@/util/setterMap/components/TransformSetterMap";
import { VisibleSetterMap } from "@/util/setterMap/components/VisibleSetterMap";

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
  displayHeight: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setDisplaySize(gameObject.displayWidth, value);
  },
  displayWidth: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setDisplaySize(value, gameObject.displayHeight);
  },
  fillAlpha: (gameObject) => (value) => gameObject.setFillStyle(gameObject.fillColor, value),
  fillColor: (gameObject) => (value) => gameObject.setFillStyle(value, gameObject.alpha),
  strokeStyle: (gameObject) => (value) => {
    if (!value) return;
    gameObject.setStrokeStyle(...value);
  },
} as const satisfies SetterMap<ShapeConfiguration, GameObjects.Shape, ShapeEventEmitsOptions>;
