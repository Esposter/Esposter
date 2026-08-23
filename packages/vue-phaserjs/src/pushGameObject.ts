import type { GameObjects } from "phaser";

import { getDepthInsertIndex } from "#src/util/getDepthInsertIndex";

export const pushGameObject = (
  parentContainer: GameObjects.Container,
  configuration: object,
  gameObject: GameObjects.GameObject,
) => {
  const i = getDepthInsertIndex(parentContainer.list, "depth" in configuration ? configuration.depth : undefined);
  if (i === -1) parentContainer.add(gameObject);
  else parentContainer.addAt(gameObject, i);
};
