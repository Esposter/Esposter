import type { IsoTriangleConfiguration } from "@/models/configuration/IsoTriangleConfiguration";
import type { IsoTriangleEventEmitsOptions } from "@/models/emit/IsoTriangleEventEmitsOptions";
import type { SetterMap } from "@/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { GlobalSetterMap } from "@/util/setterMap/global/GlobalSetterMap";
import { IsoSetterMap } from "@/util/setterMap/shared/IsoSetterMap";
import { ShapeSetterMap } from "@/util/setterMap/shared/ShapeSetterMap";

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
