import type { ShapeConfiguration } from "#src/models/configuration/shared/ShapeConfiguration";
import type { ShapeEventEmitsOptions } from "#src/models/emit/shared/ShapeEventEmitsOptions";
import type { SetterMap } from "#src/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { AlphaSingleSetterMap } from "#src/services/setterMap/components/AlphaSingleSetterMap";
import { BlendModeSetterMap } from "#src/services/setterMap/components/BlendModeSetterMap";
import { DepthSetterMap } from "#src/services/setterMap/components/DepthSetterMap";
import { DisplaySizeSetterMap } from "#src/services/setterMap/components/DisplaySizeSetterMap";
import { MaskSetterMap } from "#src/services/setterMap/components/MaskSetterMap";
import { OriginSetterMap } from "#src/services/setterMap/components/OriginSetterMap";
import { RenderNodesSetterMap } from "#src/services/setterMap/components/RenderNodesSetterMap";
import { ScrollFactorSetterMap } from "#src/services/setterMap/components/ScrollFactorSetterMap";
import { TransformSetterMap } from "#src/services/setterMap/components/TransformSetterMap";
import { VisibleSetterMap } from "#src/services/setterMap/components/VisibleSetterMap";
import { GameObjectSetterMap } from "#src/services/setterMap/global/GameObjectSetterMap";

export const ShapeSetterMap = {
  ...AlphaSingleSetterMap,
  ...BlendModeSetterMap,
  ...DepthSetterMap,
  ...DisplaySizeSetterMap,
  ...GameObjectSetterMap,
  ...MaskSetterMap,
  ...OriginSetterMap,
  ...RenderNodesSetterMap,
  ...ScrollFactorSetterMap,
  ...TransformSetterMap,
  ...VisibleSetterMap,
  fillAlpha: (gameObject) => (value) => {
    gameObject.setFillStyle(gameObject.fillColor, value);
  },
  fillColor: (gameObject) => (value) => {
    gameObject.setFillStyle(value, gameObject.fillAlpha);
  },
  strokeStyle: (gameObject) => (value) => {
    if (!value) return;
    gameObject.setStrokeStyle(...value);
  },
} as const satisfies SetterMap<ShapeConfiguration, GameObjects.Shape, ShapeEventEmitsOptions>;
