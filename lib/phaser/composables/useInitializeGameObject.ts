import { useInitializeGameObjectEvents } from "@/lib/phaser/composables/useInitializeGameObjectEvents";
import { useInitializeGameObjectSetters } from "@/lib/phaser/composables/useInitializeGameObjectSetters";
import { onNextTick } from "@/lib/phaser/hooks/onNextTick";
import { onShutdown } from "@/lib/phaser/hooks/onShutdown";
import type { SetterMap } from "@/lib/phaser/models/setterMap/SetterMap";
import { useParentContainerStore } from "@/lib/phaser/store/parentContainer";
import { InjectionKeyMap } from "@/lib/phaser/util/InjectionKeyMap";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import type { GameObjects } from "phaser";
import type { SetupContext } from "vue";

export const useInitializeGameObject = <
  TConfiguration extends object,
  TGameObject extends GameObjects.GameObject,
  TEmitsOptions extends Record<string, unknown[]>,
>(
  create: (scene: SceneWithPlugins) => TGameObject,
  configuration: () => TConfiguration,
  emit: SetupContext<TEmitsOptions>["emit"],
  setterMap: SetterMap<NoInfer<TConfiguration>, TGameObject, TEmitsOptions>,
) => {
  let gameObject: TGameObject;
  const parentContainerStore = useParentContainerStore();
  const { pushGameObject } = parentContainerStore;
  const { initializeGameObjectSetters, setterStopHandlers } = useInitializeGameObjectSetters(
    () => gameObject,
    configuration,
    emit,
    setterMap,
  );
  const { initializeGameObjectEvents, eventStopHandlers } = useInitializeGameObjectEvents();
  // This is only used to track if the current gameObject we are rendering
  // is in a parent container and append to it if it exists. We need to use
  // the vue provide / inject api as this context should not be shared across every component,
  // only the components through the current rendering tree that it belongs to
  // We can do this because phaser containers can only contain gameObjects one level deep
  const parentContainer = inject<Ref<GameObjects.Container> | null>(InjectionKeyMap.ParentContainer, null);
  // We actually can't use onCreate hook here because we can have dynamic gameObjects
  // based on vue refs that render after the scene create lifecycle
  onNextTick((scene) => {
    gameObject = create(scene);
    initializeGameObjectSetters(gameObject);
    initializeGameObjectEvents(gameObject, emit, scene);
    if (parentContainer) pushGameObject(parentContainer.value, toValue(configuration), gameObject);
  });

  onShutdown(() => {
    for (const setterStopHandler of setterStopHandlers) setterStopHandler();
    for (const eventStopHandler of eventStopHandlers) eventStopHandler();
    if (gameObject) gameObject.destroy();
  });
};
