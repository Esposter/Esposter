import type { IsoBoxConfiguration } from "#src/models/configuration/IsoBoxConfiguration";
import type { IsoBoxEventEmitsOptions } from "#src/models/emit/IsoBoxEventEmitsOptions";
import type { SetterMap } from "#src/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { GlobalSetterMap } from "#src/util/setterMap/global/GlobalSetterMap";
import { IsoSetterMap } from "#src/util/setterMap/shared/IsoSetterMap";
import { ShapeSetterMap } from "#src/util/setterMap/shared/ShapeSetterMap";

export const IsoBoxSetterMap: SetterMap<IsoBoxConfiguration, GameObjects.IsoBox, IsoBoxEventEmitsOptions> = {
  ...IsoSetterMap,
  ...ShapeSetterMap,
  ...GlobalSetterMap,
};
