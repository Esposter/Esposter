import type { GameObjects } from "phaser";

import { getDepthInsertIndex } from "#src/util/getDepthInsertIndex";

export const pushGameObject = (
  parentContainer: GameObjects.Container,
  configuration: object,
  gameObject: GameObjects.GameObject,
) => {
  const depthInsertIndex = getDepthInsertIndex(
    parentContainer.list,
    "depth" in configuration ? configuration.depth : undefined,
  );
  if (depthInsertIndex === -1) parentContainer.add(gameObject);
  else parentContainer.addAt(gameObject, depthInsertIndex);
};
