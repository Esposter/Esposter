import { GameObjectEventMap } from "@/lib/phaser/util/emit/GameObjectEventMap";
import { getEventName } from "@/lib/phaser/util/emit/getEventName";
import { isEvent } from "@/lib/phaser/util/emit/isEvent";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import type { GameObjects, Types } from "phaser";
import type { SetupContext } from "vue";

export const initializeGameObjectEvents = <
  TGameObject extends GameObjects.GameObject,
  TEmitsOptions extends Record<string, any[]>,
>(
  gameObject: TGameObject,
  emit: SetupContext<TEmitsOptions>["emit"],
  scene: SceneWithPlugins,
) => {
  const currentInstance = getCurrentInstance();
  const events = Object.keys(currentInstance?.attrs ?? {})
    .filter(isEvent)
    .map((e) => getEventName(e));
  const gameObjectEvents = Object.keys(GameObjectEventMap).filter((key) =>
    events.includes(key),
  ) as (keyof typeof GameObjectEventMap)[];
  if (gameObjectEvents.length === 0) return;

  if (!gameObject.input) gameObject.setInteractive();
  if (gameObjectEvents.some((key) => "drag" in GameObjectEventMap[key])) scene.input.setDraggable(gameObject);

  for (const gameObjectEvent of gameObjectEvents) {
    const context = GameObjectEventMap[gameObjectEvent];
    gameObject.on(gameObjectEvent, (...args: Types.Input.EventData[]) => {
      if ("eventIndex" in context) args[0].stopPropagation = args[context.eventIndex].stopPropagation;
      emit(gameObjectEvent, ...args);
    });
  }
};
