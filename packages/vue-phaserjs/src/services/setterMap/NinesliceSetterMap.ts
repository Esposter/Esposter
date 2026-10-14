import type { NinesliceConfiguration } from "#src/models/configuration/NinesliceConfiguration";
import type { NinesliceEventEmitsOptions } from "#src/models/emit/NinesliceEventEmitsOptions";
import type { SetterMap } from "#src/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { AlphaSingleSetterMap } from "#src/services/setterMap/components/AlphaSingleSetterMap";
import { ComputedSizeSetterMap } from "#src/services/setterMap/components/ComputedSizeSetterMap";
import { OriginSetterMap } from "#src/services/setterMap/components/OriginSetterMap";
import { RenderNodesSetterMap } from "#src/services/setterMap/components/RenderNodesSetterMap";
import { TextureSetterMap } from "#src/services/setterMap/components/TextureSetterMap";
import { GlobalSetterMap } from "#src/services/setterMap/global/GlobalSetterMap";
import { SceneObjectSetterMap } from "#src/services/setterMap/shared/SceneObjectSetterMap";

export const NinesliceSetterMap: SetterMap<NinesliceConfiguration, GameObjects.NineSlice, NinesliceEventEmitsOptions> =
  {
    height: ComputedSizeSetterMap.height,
    width: ComputedSizeSetterMap.width,
    ...AlphaSingleSetterMap,
    ...SceneObjectSetterMap,
    ...OriginSetterMap,
    ...RenderNodesSetterMap,
    ...TextureSetterMap,
    ...GlobalSetterMap,
  };
