import type { SceneWithPlugins } from "#src/models/scene/SceneWithPlugins";
import type { SetterMap } from "#src/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";
import type { SetupContext } from "vue";

import { useInitializeGameObjectEvents } from "#src/composables/useInitializeGameObjectEvents";
import { useInitializeGameObjectSetters } from "#src/composables/useInitializeGameObjectSetters";
import { useInjectSceneKey } from "#src/composables/useInjectSceneKey";
import { pushGameObject } from "#src/pushGameObject";
import { getScene } from "#src/util/getScene";
import { getInitializeGameObjectLifecycleHook } from "#src/util/hooks/getInitializeGameObjectLifecycleHook";
import { InjectionKeyMap } from "#src/util/InjectionKeyMap";

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
  // Without being tied to the scene's lifecycle
  immediate?: true,
) => {
  let gameObject: TGameObject;
  const { initializeGameObjectSetters, setterWatchHandles } = useInitializeGameObjectSetters(
    () => gameObject,
    configuration,
    emit,
    setterMap,
    immediate,
  );
  const { eventStopHandles, initializeGameObjectEvents } = useInitializeGameObjectEvents();
  // Track whether this gameObject sits in a parent container so we can append to it.
  // Use provide/inject so the context is scoped to the current rendering tree, not every component;
  // This works because phaser containers only hold gameObjects one level deep.
  // The default is passed explicitly because a gameObject outside any container is the normal case.
  const parentContainer = inject(InjectionKeyMap.ParentContainer, undefined);
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
    // The parent container may not exist yet, so push the gameObject after its lifecycle hook runs.
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
