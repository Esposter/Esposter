import type { GraphicsConfiguration } from "#src/models/configuration/GraphicsConfiguration";
import type { GraphicsEventEmitsOptions } from "#src/models/emit/GraphicsEventEmitsOptions";
import type { SetterMap } from "#src/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { AlphaSingleSetterMap } from "#src/services/setterMap/components/AlphaSingleSetterMap";
import { BlendModeSetterMap } from "#src/services/setterMap/components/BlendModeSetterMap";
import { DepthSetterMap } from "#src/services/setterMap/components/DepthSetterMap";
import { MaskSetterMap } from "#src/services/setterMap/components/MaskSetterMap";
import { RenderNodesSetterMap } from "#src/services/setterMap/components/RenderNodesSetterMap";
import { ScrollFactorSetterMap } from "#src/services/setterMap/components/ScrollFactorSetterMap";
import { TransformSetterMap } from "#src/services/setterMap/components/TransformSetterMap";
import { VisibleSetterMap } from "#src/services/setterMap/components/VisibleSetterMap";
import { GlobalSetterMap } from "#src/services/setterMap/global/GlobalSetterMap";

export const GraphicsSetterMap: SetterMap<GraphicsConfiguration, GameObjects.Graphics, GraphicsEventEmitsOptions> = {
  ...AlphaSingleSetterMap,
  ...BlendModeSetterMap,
  ...DepthSetterMap,
  ...MaskSetterMap,
  ...RenderNodesSetterMap,
  ...ScrollFactorSetterMap,
  ...TransformSetterMap,
  ...VisibleSetterMap,
  ...GlobalSetterMap,
};
