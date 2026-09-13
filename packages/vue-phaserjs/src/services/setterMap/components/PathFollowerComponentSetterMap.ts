import type { PathFollowerComponentConfiguration } from "#src/models/configuration/components/PathFollowerComponentConfiguration";
import type { PathFollowerComponentEventEmitsOptions } from "#src/models/emit/components/PathFollowerComponentEventEmitsOptions";
import type { SetterMap } from "#src/models/setterMap/SetterMap";
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
