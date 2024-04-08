import { GameObjectEventMap } from "@/lib/phaser/util/emit/GameObjectEventMap";
import { getEventName } from "@/lib/phaser/util/emit/getEventName";
import { isEvent } from "@/lib/phaser/util/emit/isEvent";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import type { GameObjects, Types } from "phaser";
import ClickOutside from "phaser3-rex-plugins/plugins/clickoutside.js";
import type { SetupContext } from "vue";

export const useInitializeGameObjectEvents = () => {
  const currentInstance = getCurrentInstance();
  const events = Object.keys(currentInstance?.attrs ?? {})
    .filter(isEvent)
    .map((e) => getEventName(e));
  const gameObjectEvents = Object.keys(GameObjectEventMap).filter((key) =>
    events.includes(key),
  ) as (keyof typeof GameObjectEventMap)[];
  const unsubscribes = ref<(() => void)[]>([]);
  const initializeGameObjectEvents = <
    TGameObject extends GameObjects.GameObject,
    TEmitsOptions extends Record<string, any[]>,
  >(
    gameObject: TGameObject,
    emit: SetupContext<TEmitsOptions>["emit"],
    scene: SceneWithPlugins,
  ) => {
    if (gameObjectEvents.length === 0) return;

    if (!gameObject.input) gameObject.setInteractive();
    if (gameObjectEvents.some((key) => "drag" in GameObjectEventMap[key])) scene.input.setDraggable(gameObject);

    for (const gameObjectEvent of gameObjectEvents) {
      const context = GameObjectEventMap[gameObjectEvent];
      const eventListener = (...args: Types.Input.EventData[]) => {
        if ("eventIndex" in context) args[0].stopPropagation = args[context.eventIndex].stopPropagation;
        emit(gameObjectEvent, ...args);
      };

      if (gameObjectEvent === "clickoutside") {
        const clickOutside = new ClickOutside(gameObject);
        clickOutside.on(gameObjectEvent, eventListener);
        unsubscribes.value.push(() => {
          clickOutside.off(gameObjectEvent, eventListener);
        });
        continue;
      }

      gameObject.on(gameObjectEvent, eventListener);
      unsubscribes.value.push(() => {
        gameObject.off(gameObjectEvent, eventListener);
      });
    }
  };

  return {
    initializeGameObjectEvents,
    unsubscribes,
  };
};
