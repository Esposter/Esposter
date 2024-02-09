import { GameObjectEventMap } from "@/lib/phaser/util/emit/GameObjectEventMap";
import { type SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import { type GameObjects, type Types } from "phaser";
import { type SetupContext } from "vue";

export const initializeGameObjectEvents = <
  TConfiguration extends object,
  TGameObject extends GameObjects.GameObject,
  TEmitsOptions extends Record<string, any[]>,
>(
  configuration: TConfiguration,
  gameObject: TGameObject,
  emit: SetupContext<TEmitsOptions>["emit"],
  scene: SceneWithPlugins,
) => {
  const events = Object.keys(GameObjectEventMap).filter(
    (key) => key in configuration,
  ) as (keyof typeof GameObjectEventMap)[];

  if (events.length === 0) return;

  if (!gameObject.input) gameObject.setInteractive();
  if (events.some((key) => "drag" in GameObjectEventMap[key])) scene.input.setDraggable(gameObject);

  for (const event of events) {
    const context = GameObjectEventMap[event];
    gameObject.on(event, (...args: Types.Input.EventData[]) => {
      if ("eventIndex" in context) args[0].stopPropagation = args[context.eventIndex].stopPropagation;
      emit(event, ...args);
    });
  }
};
