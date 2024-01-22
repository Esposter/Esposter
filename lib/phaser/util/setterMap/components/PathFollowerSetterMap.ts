import { type SetterMap } from "@/lib/phaser/models/setterMap/SetterMap";
import { type GameObjects } from "phaser";

export const PathFollowerSetterMap = {
  path: (gameObject) => (value) => gameObject.setPath(value),
} satisfies SetterMap<GameObjects.Components.PathFollower, GameObjects.Components.PathFollower>;
