import { type SetterMap } from "@/lib/phaser/models/SetterMap";
import { type GameObjects } from "phaser";

export const PipelineSetterMap = {
  pipeline: (gameObject) => (value) => gameObject.setPipeline(value),
} satisfies SetterMap<GameObjects.Components.Pipeline, GameObjects.Components.Pipeline>;
