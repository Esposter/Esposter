import type { SceneWithPlugins } from "@/models/scene/SceneWithPlugins";
import type { GameObjects, Types } from "phaser";
import type { SetupContext } from "vue";

import { GameObjectEventMap } from "@/util/emit/GameObjectEventMap";
import { getEventName } from "@/util/emit/getEventName";
import { isEvent } from "@/util/emit/isEvent";
import ClickOutside from "phaser3-rex-plugins/plugins/clickoutside.js";

export const useInitializeGameObjectEvents = () => {
  const currentInstance = getCurrentInstance();
  const events = new Set(
    Object.keys(currentInstance?.attrs ?? {})
      .filter((key) => isEvent(key))
      .map((key) => getEventName(key)),
  );
  const gameObjectEvents = Object.keys(GameObjectEventMap).filter((key) =>
    events.has(key),
  ) as (keyof typeof GameObjectEventMap)[];
  const eventStopHandles: (() => void)[] = [];
  const initializeGameObjectEvents = <TEmitsOptions extends Record<string, unknown[]>>(
    gameObject: GameObjects.GameObject,
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
        eventStopHandles.push(() => {
          clickOutside.off(gameObjectEvent, eventListener);
        });
        continue;
      }

      gameObject.on(gameObjectEvent, eventListener);
      eventStopHandles.push(() => {
        gameObject.off(gameObjectEvent, eventListener);
      });
    }
  };
  return { eventStopHandles, initializeGameObjectEvents };
};
