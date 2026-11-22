import type { SceneWithPlugins } from "#src/models/scene/SceneWithPlugins";
import type { GameObjects, Types } from "phaser";
import type { SetupContext } from "vue";

import { GameObjectEvent } from "#src/models/emit/GameObjectEvent";
import { checkIsEvent } from "#src/services/emit/checkIsEvent";
import { GameObjectEventMap } from "#src/services/emit/GameObjectEventMap";
import { getEventName } from "#src/services/emit/getEventName";
import { onClickOutside } from "#src/services/emit/onClickOutside";
import { takeOne } from "@esposter/shared";

export const useInitializeGameObjectEvents = () => {
  const currentInstance = getCurrentInstance();
  const events = new Set(
    Object.keys(currentInstance?.attrs ?? {})
      .filter((key) => checkIsEvent(key))
      .map((key) => getEventName(key)),
  );
  const gameObjectEvents = Object.keys(GameObjectEventMap).filter((key): key is keyof typeof GameObjectEventMap =>
    events.has(key),
  );
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
      // Phaser has no click-outside event of its own, so it is read from the scene's input rather than the game object
      if (gameObjectEvent === GameObjectEvent.Clickoutside) {
        eventStopHandles.push(
          onClickOutside(gameObject, (pointer) => {
            emit(gameObjectEvent, pointer);
          }),
        );
        continue;
      }

      const context = GameObjectEventMap[gameObjectEvent];
      const eventListener = (...args: Types.Input.EventData[]) => {
        if ("eventIndex" in context) takeOne(args).stopPropagation = takeOne(args, context.eventIndex).stopPropagation;
        emit(gameObjectEvent, ...args);
      };
      gameObject.on(gameObjectEvent, eventListener);
      eventStopHandles.push(() => {
        gameObject.off(gameObjectEvent, eventListener);
      });
    }
  };
  return { eventStopHandles, initializeGameObjectEvents };
};
