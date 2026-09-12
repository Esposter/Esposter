import type { IsoTriangleConfiguration } from "#src/models/configuration/IsoTriangleConfiguration";
import type { IsoTriangleEventEmitsOptions } from "#src/models/emit/IsoTriangleEventEmitsOptions";
import type { SetterMap } from "#src/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { GlobalSetterMap } from "#src/services/setterMap/global/GlobalSetterMap";
import { IsoSetterMap } from "#src/services/setterMap/shared/IsoSetterMap";
import { ShapeSetterMap } from "#src/services/setterMap/shared/ShapeSetterMap";

export const IsoTriangleSetterMap: SetterMap<
  IsoTriangleConfiguration,
  GameObjects.IsoTriangle,
  IsoTriangleEventEmitsOptions
> = {
  isReversed: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setReversed(value);
  },
  ...IsoSetterMap,
  ...ShapeSetterMap,
  ...GlobalSetterMap,
};
