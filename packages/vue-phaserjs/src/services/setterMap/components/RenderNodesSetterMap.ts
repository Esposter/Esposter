import type { RenderNodesConfiguration } from "#src/models/configuration/components/RenderNodesConfiguration";
import type { RenderNodesEventEmitsOptions } from "#src/models/emit/components/RenderNodesEventEmitsOptions";
import type { SetterMap } from "#src/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

export const RenderNodesSetterMap = {} as const satisfies SetterMap<
  RenderNodesConfiguration,
  GameObjects.Components.RenderNodes,
  RenderNodesEventEmitsOptions
>;
