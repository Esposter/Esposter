import { InjectionKeyMap } from "@/lib/phaser/models/InjectionKeyMap";
import { type GameObjects } from "phaser";

export const useParentContainerStore = defineStore("parentContainer", () => {
  const pushGameObject = <TConfiguration extends object, TGameObject extends GameObjects.GameObject>(
    configuration: TConfiguration,
    gameObject: TGameObject,
  ) => {
    // This is only used to track if the current gameObject we are rendering
    // is in a parent container and append to it if it exists. We need to use
    // the vue provide / inject api as this context should not be shared across every component,
    // only the components through the current rendering tree that it belongs to
    // We can do this because phaser containers can only contain gameObjects one level deep
    const parentContainer = inject<GameObjects.Container | null>(InjectionKeyMap.ParentContainer, null);
    if (!parentContainer) return;

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
