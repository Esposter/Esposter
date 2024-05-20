import type { PipelineConfiguration } from "@/lib/phaser/models/configuration/components/PipelineConfiguration";
import type { PipelineEventEmitsOptions } from "@/lib/phaser/models/emit/components/PipelineEventEmitsOptions";
import type { SetterMap } from "@/lib/phaser/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

export const PipelineSetterMap = {
  pipeline: (gameObject) => (value) => {
    if (!value) return;
    gameObject.setPipeline(value);
  },
} as const satisfies SetterMap<PipelineConfiguration, GameObjects.Components.Pipeline, PipelineEventEmitsOptions>;
