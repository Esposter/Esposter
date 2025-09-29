import type { GameObjects } from "phaser";

export const pushGameObject = (
  parentContainer: GameObjects.Container,
  configuration: object,
  gameObject: GameObjects.GameObject,
) => {
  const i = parentContainer.list.findIndex(
    (obj) =>
      "depth" in obj &&
      typeof obj.depth === "number" &&
      "depth" in configuration &&
      typeof configuration.depth === "number" &&
      obj.depth > configuration.depth,
  );
  if (i === -1) parentContainer.add(gameObject);
  else parentContainer.addAt(gameObject, i);
};
