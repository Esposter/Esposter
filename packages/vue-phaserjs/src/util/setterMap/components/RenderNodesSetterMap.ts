import type { RenderNodesConfiguration } from "@/models/configuration/components/RenderNodesConfiguration";
import type { RenderNodesEventEmitsOptions } from "@/models/emit/components/RenderNodesEventEmitsOptions";
import type { SetterMap } from "@/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

export const RenderNodesSetterMap = {} as const satisfies SetterMap<
  RenderNodesConfiguration,
  GameObjects.Components.RenderNodes,
  RenderNodesEventEmitsOptions
>;
