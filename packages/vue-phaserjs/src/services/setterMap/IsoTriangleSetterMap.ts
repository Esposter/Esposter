import type { IsoTriangleConfiguration } from "#src/models/configuration/IsoTriangleConfiguration";
import type { IsoTriangleEventEmitsOptions } from "#src/models/emit/IsoTriangleEventEmitsOptions";
import type { SetterMap } from "#src/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { IsoTriangleSetter } from "#src/models/setterMap/IsoTriangleSetter";
import { GlobalSetterMap } from "#src/services/setterMap/global/GlobalSetterMap";
import { IsoSetterMap } from "#src/services/setterMap/shared/IsoSetterMap";
import { ShapeSetterMap } from "#src/services/setterMap/shared/ShapeSetterMap";

export const IsoTriangleSetterMap: SetterMap<
  IsoTriangleConfiguration,
  GameObjects.IsoTriangle,
  IsoTriangleEventEmitsOptions
> = {
  [IsoTriangleSetter.IsReversed]: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setReversed(value);
  },
  ...IsoSetterMap,
  ...ShapeSetterMap,
  ...GlobalSetterMap,
};
