import type { GraphicsConfiguration } from "#src/models/configuration/GraphicsConfiguration";
import type { GraphicsEventEmitsOptions } from "#src/models/emit/GraphicsEventEmitsOptions";
import type { SetterMap } from "#src/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { AlphaSingleSetterMap } from "#src/services/setterMap/components/AlphaSingleSetterMap";
import { RenderNodesSetterMap } from "#src/services/setterMap/components/RenderNodesSetterMap";
import { GlobalSetterMap } from "#src/services/setterMap/global/GlobalSetterMap";
import { SceneObjectSetterMap } from "#src/services/setterMap/shared/SceneObjectSetterMap";

export const GraphicsSetterMap: SetterMap<GraphicsConfiguration, GameObjects.Graphics, GraphicsEventEmitsOptions> = {
  ...AlphaSingleSetterMap,
  ...SceneObjectSetterMap,
  ...RenderNodesSetterMap,
  ...GlobalSetterMap,
};
