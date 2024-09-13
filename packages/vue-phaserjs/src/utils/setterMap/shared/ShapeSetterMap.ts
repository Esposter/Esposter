import type { ShapeConfiguration } from "@/models/configuration/shared/ShapeConfiguration";
import type { ShapeEventEmitsOptions } from "@/models/emit/shared/ShapeEventEmitsOptions";
import type { SetterMap } from "@/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { AlphaSingleSetterMap } from "@/utils/setterMap/components/AlphaSingleSetterMap";
import { BlendModeSetterMap } from "@/utils/setterMap/components/BlendModeSetterMap";
import { DepthSetterMap } from "@/utils/setterMap/components/DepthSetterMap";
import { MaskSetterMap } from "@/utils/setterMap/components/MaskSetterMap";
import { OriginSetterMap } from "@/utils/setterMap/components/OriginSetterMap";
import { PipelineSetterMap } from "@/utils/setterMap/components/PipelineSetterMap";
import { ScrollFactorSetterMap } from "@/utils/setterMap/components/ScrollFactorSetterMap";
import { TransformSetterMap } from "@/utils/setterMap/components/TransformSetterMap";
import { VisibleSetterMap } from "@/utils/setterMap/components/VisibleSetterMap";

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
