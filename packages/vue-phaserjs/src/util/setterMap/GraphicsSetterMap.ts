import type { GraphicsConfiguration } from "#src/models/configuration/GraphicsConfiguration";
import type { GraphicsEventEmitsOptions } from "#src/models/emit/GraphicsEventEmitsOptions";
import type { SetterMap } from "#src/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { AlphaSingleSetterMap } from "#src/util/setterMap/components/AlphaSingleSetterMap";
import { BlendModeSetterMap } from "#src/util/setterMap/components/BlendModeSetterMap";
import { DepthSetterMap } from "#src/util/setterMap/components/DepthSetterMap";
import { MaskSetterMap } from "#src/util/setterMap/components/MaskSetterMap";
import { RenderNodesSetterMap } from "#src/util/setterMap/components/RenderNodesSetterMap";
import { ScrollFactorSetterMap } from "#src/util/setterMap/components/ScrollFactorSetterMap";
import { TransformSetterMap } from "#src/util/setterMap/components/TransformSetterMap";
import { VisibleSetterMap } from "#src/util/setterMap/components/VisibleSetterMap";
import { GlobalSetterMap } from "#src/util/setterMap/global/GlobalSetterMap";

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
