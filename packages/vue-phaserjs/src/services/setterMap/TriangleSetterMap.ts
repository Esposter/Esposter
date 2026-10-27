import type { TriangleConfiguration } from "#src/models/configuration/TriangleConfiguration";
import type { TriangleEventEmitsOptions } from "#src/models/emit/TriangleEventEmitsOptions";
import type { SetterMap } from "#src/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { TriangleSetter } from "#src/models/setterMap/TriangleSetter";
import { GlobalSetterMap } from "#src/services/setterMap/global/GlobalSetterMap";
import { ShapeSetterMap } from "#src/services/setterMap/shared/ShapeSetterMap";

export const TriangleSetterMap: SetterMap<TriangleConfiguration, GameObjects.Triangle, TriangleEventEmitsOptions> = {
  [TriangleSetter.To]: (gameObject) => (value) => {
    if (!value) return;
    gameObject.setTo(...value);
  },
  ...ShapeSetterMap,
  ...GlobalSetterMap,
};
