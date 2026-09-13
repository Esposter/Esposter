import type { DepthConfiguration } from "#src/models/configuration/components/DepthConfiguration";
import type { DepthEventEmitsOptions } from "#src/models/emit/components/DepthEventEmitsOptions";
import type { SetterMap } from "#src/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { getDepthInsertIndex } from "#src/util/getDepthInsertIndex";

export const DepthSetterMap = {
  depth: (gameObject) => (value) => {
    if (value === undefined) return;

    gameObject.setDepth(value);
    // Phaser types `parentContainer` as always present, but a game object added straight to the scene has none
    if (!(gameObject.parentContainer as GameObjects.Container | null)) return;
    const { list } = gameObject.parentContainer;
    const depthInsertIndex = getDepthInsertIndex(list, gameObject.depth);
    if (depthInsertIndex === -1) gameObject.parentContainer.bringToTop(gameObject);
    else {
      // `moveTo` inserts into the list after removing `gameObject` from its current position, so an insert index
      // Found ahead of that position has already shifted back by one
      const currentIndex = list.indexOf(gameObject);
      gameObject.parentContainer.moveTo(
        gameObject,
        currentIndex < depthInsertIndex ? depthInsertIndex - 1 : depthInsertIndex,
      );
    }
  },
} as const satisfies SetterMap<
  DepthConfiguration,
  GameObjects.Components.Depth & GameObjects.GameObject,
  DepthEventEmitsOptions
>;
