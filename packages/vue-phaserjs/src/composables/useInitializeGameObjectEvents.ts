import type { SceneWithPlugins } from "#src/models/scene/SceneWithPlugins";
import type { GameObjects, Types } from "phaser";
import type { SetupContext } from "vue";

import { checkIsEvent } from "#src/services/emit/checkIsEvent";
import { GameObjectEventMap } from "#src/services/emit/GameObjectEventMap";
import { getEventName } from "#src/services/emit/getEventName";
import { takeOne } from "@esposter/shared";
import ClickOutside from "phaser4-rex-plugins/plugins/clickoutside.js";

export const useInitializeGameObjectEvents = () => {
  const currentInstance = getCurrentInstance();
  const events = new Set(
    Object.keys(currentInstance?.attrs ?? {})
      .filter((key) => checkIsEvent(key))
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
        if ("eventIndex" in context) takeOne(args).stopPropagation = takeOne(args, context.eventIndex).stopPropagation;
        emit(gameObjectEvent, ...args);
      };
      // The rex plugin emits its event from a component of its own rather than from the game object
      const emitter = gameObjectEvent === "clickoutside" ? new ClickOutside(gameObject) : gameObject;
      emitter.on(gameObjectEvent, eventListener);
      eventStopHandles.push(() => {
        emitter.off(gameObjectEvent, eventListener);
      });
    }
  };
  return { eventStopHandles, initializeGameObjectEvents };
};
