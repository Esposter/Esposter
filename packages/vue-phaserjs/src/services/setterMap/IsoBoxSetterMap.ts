import type { IsoBoxConfiguration } from "#src/models/configuration/IsoBoxConfiguration";
import type { IsoBoxEventEmitsOptions } from "#src/models/emit/IsoBoxEventEmitsOptions";
import type { SetterMap } from "#src/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { TweenSetterMap } from "#src/services/setterMap/global/TweenSetterMap";
import { IsoSetterMap } from "#src/services/setterMap/shared/IsoSetterMap";
import { ShapeSetterMap } from "#src/services/setterMap/shared/ShapeSetterMap";

export const IsoBoxSetterMap: SetterMap<IsoBoxConfiguration, GameObjects.IsoBox, IsoBoxEventEmitsOptions> = {
  ...IsoSetterMap,
  ...ShapeSetterMap,
  ...TweenSetterMap,
};
