import type { RenderNodesConfiguration } from "#src/models/configuration/components/RenderNodesConfiguration";
import type { RenderNodesEventEmitsOptions } from "#src/models/emit/components/RenderNodesEventEmitsOptions";
import type { SetterMap } from "#src/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { RenderNodesSetter } from "#src/models/setterMap/components/RenderNodesSetter";

export const RenderNodesSetterMap = {
  [RenderNodesSetter.CustomRenderNodes]: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.customRenderNodes = value;
  },
  [RenderNodesSetter.DefaultRenderNodes]: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.defaultRenderNodes = value;
  },
  [RenderNodesSetter.RenderNodeData]: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.renderNodeData = value;
  },
} as const satisfies SetterMap<
  RenderNodesConfiguration,
  GameObjects.Components.RenderNodes,
  RenderNodesEventEmitsOptions
>;
