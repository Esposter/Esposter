import type { SetterMap } from "@/lib/phaser/models/setterMap/SetterMap";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import type { GameObjects } from "phaser";
import type { SetupContext } from "vue";

import { useInitializeGameObjectEvents } from "@/lib/phaser/composables/useInitializeGameObjectEvents";
import { useInitializeGameObjectSetters } from "@/lib/phaser/composables/useInitializeGameObjectSetters";
import { useInjectSceneKey } from "@/lib/phaser/composables/useInjectSceneKey";
import { useParentContainerStore } from "@/lib/phaser/store/parentContainer";
import { getScene } from "@/lib/phaser/util/getScene";
import { getInitializeGameObjectLifecycleHook } from "@/lib/phaser/util/hooks/getInitializeGameObjectLifecycleHook";
import { InjectionKeyMap } from "@/lib/phaser/util/InjectionKeyMap";

export const useInitializeGameObject = <
  TConfiguration extends object,
  TGameObject extends GameObjects.GameObject,
  TEmitsOptions extends Record<string, unknown[]>,
>(
  create: (scene: SceneWithPlugins) => TGameObject,
  configuration: () => TConfiguration,
  emit: SetupContext<TEmitsOptions>["emit"],
  setterMap: SetterMap<NoInfer<TConfiguration>, TGameObject, TEmitsOptions>,
  // We may want to create gameObjects e.g. Sprites for attacks immediately
  // without being tied to the scene's lifecycle
  immediate?: true,
) => {
  let gameObject: TGameObject;
  const parentContainerStore = useParentContainerStore();
  const { pushGameObject } = parentContainerStore;
  const { initializeGameObjectSetters, setterStopHandlers } = useInitializeGameObjectSetters(
    () => gameObject,
    configuration,
    emit,
    setterMap,
    immediate,
  );
  const { eventStopHandlers, initializeGameObjectEvents } = useInitializeGameObjectEvents();
  // This is only used to track if the current gameObject we are rendering
  // is in a parent container and append to it if it exists. We need to use
  // the vue provide / inject api as this context should not be shared across every component,
  // only the components through the current rendering tree that it belongs to
  // We can do this because phaser containers can only contain gameObjects one level deep
  const parentContainer = inject<null | Ref<GameObjects.Container>>(InjectionKeyMap.ParentContainer, null);
  const sceneKey = useInjectSceneKey();
  const lifecycleHook = getInitializeGameObjectLifecycleHook(sceneKey);
  const initializeGameObject = (scene: SceneWithPlugins) => {
    gameObject = create(scene);
    initializeGameObjectSetters(gameObject);
    initializeGameObjectEvents(gameObject, emit, scene);
  };
  const pushToParentContainer = () => {
    if (parentContainer) pushGameObject(parentContainer.value, toValue(configuration), gameObject);
  };

  if (immediate) {
    const scene = getScene(sceneKey);
    initializeGameObject(scene);
    // The parent container may not be immediately created in comparison to this gameObject
    // so we still need to push the gameObject after the parentContainer's lifecycle hook is run
    lifecycleHook(() => {
      pushToParentContainer();
    });
  } else
    lifecycleHook((scene) => {
      initializeGameObject(scene);
      pushToParentContainer();
    });

  onUnmounted(() => {
    for (const setterStopHandler of setterStopHandlers) setterStopHandler();
    for (const eventStopHandler of eventStopHandlers) eventStopHandler();
    if (gameObject) gameObject.destroy();
  });
};
