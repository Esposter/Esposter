import type { PipelineConfiguration } from "@/models/configuration/components/PipelineConfiguration";
import type { PipelineEventEmitsOptions } from "@/models/emit/components/PipelineEventEmitsOptions";
import type { SetterMap } from "@/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

export const PipelineSetterMap = {
  pipeline: (gameObject) => (value) => {
    if (!value) return;
    gameObject.setPipeline(value);
  },
} as const satisfies SetterMap<PipelineConfiguration, GameObjects.Components.Pipeline, PipelineEventEmitsOptions>;
