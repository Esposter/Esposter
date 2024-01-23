import { type PathFollowerConfiguration } from "@/lib/phaser/models/configuration/components/PathFollowerConfiguration";
import { type SetterMap } from "@/lib/phaser/models/setterMap/SetterMap";
import { type GameObjects } from "phaser";

export const PathFollowerSetterMap = {
  path: (gameObject) => (value) => gameObject.setPath(value),
} satisfies SetterMap<PathFollowerConfiguration, GameObjects.Components.PathFollower>;
