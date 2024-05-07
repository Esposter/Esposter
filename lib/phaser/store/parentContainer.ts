import type { GameObjects } from "phaser";

export const useParentContainerStore = defineStore("phaser/parentContainer", () => {
  const pushGameObject = <TConfiguration extends object, TGameObject extends GameObjects.GameObject>(
    parentContainer: GameObjects.Container,
    configuration: TConfiguration,
    gameObject: TGameObject,
  ) => {
    const i = parentContainer.list.findIndex(
      (obj) =>
        "depth" in obj &&
        typeof obj.depth === "number" &&
        "depth" in configuration &&
        typeof configuration.depth === "number" &&
        obj.depth > configuration.depth,
    );
    i === -1 ? parentContainer.add(gameObject) : parentContainer.addAt(gameObject, i);
  };
  return {
    pushGameObject,
  };
});
