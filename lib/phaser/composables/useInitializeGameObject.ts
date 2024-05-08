import { useInitializeGameObjectEvents } from "@/lib/phaser/composables/useInitializeGameObjectEvents";
import { useInitializeGameObjectSetters } from "@/lib/phaser/composables/useInitializeGameObjectSetters";
import { useInjectSceneKey } from "@/lib/phaser/composables/useInjectSceneKey";
import type { SetterMap } from "@/lib/phaser/models/setterMap/SetterMap";
import { useParentContainerStore } from "@/lib/phaser/store/parentContainer";
import { InjectionKeyMap } from "@/lib/phaser/util/InjectionKeyMap";
import { getScene } from "@/lib/phaser/util/getScene";
import { getInitializeGameObjectLifecycleHook } from "@/lib/phaser/util/hooks/getInitializeGameObjectLifecycleHook";
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
  // We may want to create gameObjects e.g. Sprites for attacks on the fly
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
  const { initializeGameObjectEvents, eventStopHandlers } = useInitializeGameObjectEvents();
  // This is only used to track if the current gameObject we are rendering
  // is in a parent container and append to it if it exists. We need to use
  // the vue provide / inject api as this context should not be shared across every component,
  // only the components through the current rendering tree that it belongs to
  // We can do this because phaser containers can only contain gameObjects one level deep
  const parentContainer = inject<Ref<GameObjects.Container> | null>(InjectionKeyMap.ParentContainer, null);
  const sceneKey = useInjectSceneKey();
  const lifecycleHook = getInitializeGameObjectLifecycleHook(sceneKey);
  const initializeGameObject = (scene: SceneWithPlugins) => {
    gameObject = create(scene);
    initializeGameObjectSetters(gameObject);
    initializeGameObjectEvents(gameObject, emit, scene);
  };

  if (immediate) {
    const scene = getScene(sceneKey);
    initializeGameObject(scene);
    lifecycleHook(() => {
      if (parentContainer) pushGameObject(parentContainer.value, toValue(configuration), gameObject);
    });
  } else
    lifecycleHook((scene) => {
      initializeGameObject(scene);
      if (parentContainer) pushGameObject(parentContainer.value, toValue(configuration), gameObject);
    });

  onUnmounted(() => {
    for (const setterStopHandler of setterStopHandlers) setterStopHandler();
    for (const eventStopHandler of eventStopHandlers) eventStopHandler();
    if (gameObject) gameObject.destroy();
  });
};
