import type { SceneWithPlugins } from "@/models/scene/SceneWithPlugins";
import type { SetterMap } from "@/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";
import type { SetupContext } from "vue";

import { useInitializeGameObjectEvents } from "@/composables/useInitializeGameObjectEvents";
import { useInitializeGameObjectSetters } from "@/composables/useInitializeGameObjectSetters";
import { useInjectSceneKey } from "@/composables/useInjectSceneKey";
import { useParentContainerStore } from "@/store/parentContainer";
import { getScene } from "@/util/getScene";
import { getInitializeGameObjectLifecycleHook } from "@/util/hooks/getInitializeGameObjectLifecycleHook";
import { InjectionKeyMap } from "@/util/InjectionKeyMap";

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
  const { initializeGameObjectSetters, setterWatchHandles } = useInitializeGameObjectSetters(
    () => gameObject,
    configuration,
    emit,
    setterMap,
    immediate,
  );
  const { eventStopHandles, initializeGameObjectEvents } = useInitializeGameObjectEvents();
  // This is only used to track if the current gameObject we are rendering
  // is in a parent container and append to it if it exists. We need to use
  // the vue provide / inject api as this context should not be shared across every component,
  // only the components through the current rendering tree that it belongs to
  // We can do this because phaser containers can only contain gameObjects one level deep
  const parentContainer = inject(InjectionKeyMap.ParentContainer);
  const sceneKey = useInjectSceneKey();
  const lifecycleHook = getInitializeGameObjectLifecycleHook(sceneKey);
  const initializeGameObject = (scene: SceneWithPlugins) => {
    gameObject = create(scene);
    initializeGameObjectSetters(gameObject);
    initializeGameObjectEvents(gameObject, emit, scene);
  };
  const pushToParentContainer = () => {
    if (!parentContainer?.value) return;
    pushGameObject(parentContainer.value, toValue(configuration), gameObject);
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
    for (const setterWatchHandle of setterWatchHandles) setterWatchHandle();
    for (const eventStopHandle of eventStopHandles) eventStopHandle();
    gameObject.destroy();
  });
};
