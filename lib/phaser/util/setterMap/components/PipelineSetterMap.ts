import { type PipelineConfiguration } from "@/lib/phaser/models/configuration/components/PipelineConfiguration";
import { type SetterMap } from "@/lib/phaser/models/setterMap/SetterMap";
import { type GameObjects } from "phaser";

export const PipelineSetterMap = {
  pipeline: (gameObject) => (value) => {
    if (!value) return;
    gameObject.setPipeline(value);
  },
} satisfies SetterMap<PipelineConfiguration, GameObjects.Components.Pipeline>;
