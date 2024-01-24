import { type GameObjects } from "phaser";

export const useParentContainerStore = defineStore("parentContainer", () => {
  // This is only used to track if the current gameObject we are rendering
  // is in a parent container and append to it if it exists
  const parentContainer = ref<GameObjects.Container | null>(null);
  const pushGameObject = <TConfiguration extends object, TGameObject extends GameObjects.GameObject>(
    configuration: TConfiguration,
    gameObject: TGameObject,
  ) => {
    if (!parentContainer.value) return;

    const i = parentContainer.value.list.findIndex(
      (obj) =>
        "depth" in obj &&
        typeof obj.depth === "number" &&
        "depth" in configuration &&
        typeof configuration.depth === "number" &&
        obj.depth > configuration.depth,
    );
    i === -1 ? parentContainer.value.add(gameObject) : parentContainer.value.addAt(gameObject, i);
  };
  return {
    parentContainer,
    pushGameObject,
  };
});
