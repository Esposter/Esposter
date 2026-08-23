import type { TriangleConfiguration } from "#src/models/configuration/TriangleConfiguration";
import type { TriangleEventEmitsOptions } from "#src/models/emit/TriangleEventEmitsOptions";
import type { SetterMap } from "#src/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { GlobalSetterMap } from "#src/util/setterMap/global/GlobalSetterMap";
import { ShapeSetterMap } from "#src/util/setterMap/shared/ShapeSetterMap";

export const TriangleSetterMap: SetterMap<TriangleConfiguration, GameObjects.Triangle, TriangleEventEmitsOptions> = {
  to: (gameObject) => (value) => {
    if (!value) return;
    gameObject.setTo(...value);
  },
  ...ShapeSetterMap,
  ...GlobalSetterMap,
};
