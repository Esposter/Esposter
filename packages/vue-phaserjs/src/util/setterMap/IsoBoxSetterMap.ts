import type { IsoBoxConfiguration } from "@/models/configuration/IsoBoxConfiguration";
import type { IsoBoxEventEmitsOptions } from "@/models/emit/IsoBoxEventEmitsOptions";
import type { SetterMap } from "@/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { GlobalSetterMap } from "@/util/setterMap/global/GlobalSetterMap";
import { IsoSetterMap } from "@/util/setterMap/shared/IsoSetterMap";
import { ShapeSetterMap } from "@/util/setterMap/shared/ShapeSetterMap";

export const IsoBoxSetterMap: SetterMap<IsoBoxConfiguration, GameObjects.IsoBox, IsoBoxEventEmitsOptions> = {
  ...IsoSetterMap,
  ...ShapeSetterMap,
  ...GlobalSetterMap,
};
