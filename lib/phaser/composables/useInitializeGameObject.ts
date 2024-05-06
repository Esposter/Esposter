import { useInitializeGameObjectEvents } from "@/lib/phaser/composables/useInitializeGameObjectEvents";
import { useInitializeGameObjectSetters } from "@/lib/phaser/composables/useInitializeGameObjectSetters";
import { onCreate } from "@/lib/phaser/hooks/onCreate";
import { onShutdown } from "@/lib/phaser/hooks/onShutdown";
import type { SetterMap } from "@/lib/phaser/models/setterMap/SetterMap";
import { useParentContainerStore } from "@/lib/phaser/store/phaser/parentContainer";
import { InjectionKeyMap } from "@/lib/phaser/util/InjectionKeyMap";
import type { GameObjects } from "phaser";
import type { SetupContext } from "vue";

export const useInitializeGameObject = <
  TConfiguration extends object,
  TGameObject extends GameObjects.GameObject,
  TEmitsOptions extends Record<string, unknown[]>,
>(
  gameObject: Ref<TGameObject>,
  configuration: Ref<TConfiguration>,
  emit: SetupContext<TEmitsOptions>["emit"],
  setterMap: SetterMap<NoInfer<TConfiguration>, TGameObject, TEmitsOptions>,
) => {
  const parentContainerStore = useParentContainerStore();
  const { pushGameObject } = parentContainerStore;
  const setters = useInitializeGameObjectSetters(configuration, gameObject, emit, setterMap);
  const { initializeGameObjectEvents, unsubscribes } = useInitializeGameObjectEvents();
  // This is only used to track if the current gameObject we are rendering
  // is in a parent container and append to it if it exists. We need to use
  // the vue provide / inject api as this context should not be shared across every component,
  // only the components through the current rendering tree that it belongs to
  // We can do this because phaser containers can only contain gameObjects one level deep
  const parentContainer = inject<GameObjects.Container | null>(InjectionKeyMap.ParentContainer, null);

  onCreate((scene) => {
    if (parentContainer) pushGameObject(parentContainer, configuration.value, gameObject.value);
    for (const setter of setters) setter(gameObject.value);
    initializeGameObjectEvents(gameObject.value, emit, scene);
  });

  onShutdown(() => {
    for (const unsubscribe of unsubscribes) unsubscribe();
    gameObject.value.destroy();
  });
};
