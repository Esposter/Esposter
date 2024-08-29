import type { PathFollowerComponentConfiguration } from "@/lib/phaser/models/configuration/components/PathFollowerComponentConfiguration";
import type { PathFollowerComponentEventEmitsOptions } from "@/lib/phaser/models/emit/components/PathFollowerComponentEventEmitsOptions";
import type { SetterMap } from "@/lib/phaser/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

export const PathFollowerComponentSetterMap = {
  path: (gameObject) => (value) => {
    if (!value) return;
    gameObject.setPath(value);
  },
} as const satisfies SetterMap<
  PathFollowerComponentConfiguration,
  GameObjects.Components.PathFollower,
  PathFollowerComponentEventEmitsOptions
>;
