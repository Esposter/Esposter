import type { TriangleConfiguration } from "@/models/configuration/TriangleConfiguration";
import type { TriangleEventEmitsOptions } from "@/models/emit/TriangleEventEmitsOptions";
import type { SetterMap } from "@/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { GlobalSetterMap } from "@/util/setterMap/global/GlobalSetterMap";
import { ShapeSetterMap } from "@/util/setterMap/shared/ShapeSetterMap";

export const TriangleSetterMap: SetterMap<TriangleConfiguration, GameObjects.Triangle, TriangleEventEmitsOptions> = {
  to: (gameObject) => (value) => {
    if (!value) return;
    gameObject.setTo(...value);
  },
  ...ShapeSetterMap,
  ...GlobalSetterMap,
};
