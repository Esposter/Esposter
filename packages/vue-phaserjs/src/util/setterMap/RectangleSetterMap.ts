import type { RectangleConfiguration } from "#src/models/configuration/RectangleConfiguration";
import type { RectangleEventEmitsOptions } from "#src/models/emit/RectangleEventEmitsOptions";
import type { SetterMap } from "#src/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { ComputedSizeSetterMap } from "#src/util/setterMap/components/ComputedSizeSetterMap";
import { GlobalSetterMap } from "#src/util/setterMap/global/GlobalSetterMap";
import { ShapeSetterMap } from "#src/util/setterMap/shared/ShapeSetterMap";

export const RectangleSetterMap: SetterMap<RectangleConfiguration, GameObjects.Rectangle, RectangleEventEmitsOptions> =
  {
    height: ComputedSizeSetterMap.height,
    width: ComputedSizeSetterMap.width,
    ...ShapeSetterMap,
    ...GlobalSetterMap,
  };
