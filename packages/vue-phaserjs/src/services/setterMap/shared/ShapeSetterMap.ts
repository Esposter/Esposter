import type { ShapeConfiguration } from "#src/models/configuration/shared/ShapeConfiguration";
import type { ShapeEventEmitsOptions } from "#src/models/emit/shared/ShapeEventEmitsOptions";
import type { SetterMap } from "#src/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { AlphaSingleSetterMap } from "#src/services/setterMap/components/AlphaSingleSetterMap";
import { DisplaySizeSetterMap } from "#src/services/setterMap/components/DisplaySizeSetterMap";
import { OriginSetterMap } from "#src/services/setterMap/components/OriginSetterMap";
import { RenderNodesSetterMap } from "#src/services/setterMap/components/RenderNodesSetterMap";
import { GameObjectSetterMap } from "#src/services/setterMap/global/GameObjectSetterMap";
import { SceneObjectSetterMap } from "#src/services/setterMap/shared/SceneObjectSetterMap";
import { ShapeSetter } from "#src/models/setterMap/shared/ShapeSetter";

export const ShapeSetterMap = {
  ...AlphaSingleSetterMap,
  ...SceneObjectSetterMap,
  ...DisplaySizeSetterMap,
  ...GameObjectSetterMap,
  ...OriginSetterMap,
  ...RenderNodesSetterMap,
  // Setting the alpha on its own must not fill the shape, which `setFillStyle` would do
  [ShapeSetter.FillAlpha]: (gameObject) => (value) => {
    if (value === undefined) return;

    gameObject.fillAlpha = value;
  },
  [ShapeSetter.FillColor]: (gameObject) => (value) => {
    gameObject.setFillStyle(value, gameObject.fillAlpha);
  },
  [ShapeSetter.StrokeStyle]: (gameObject) => (value) => {
    if (!value) return;
    gameObject.setStrokeStyle(...value);
  },
} as const satisfies SetterMap<ShapeConfiguration, GameObjects.Shape, ShapeEventEmitsOptions>;
