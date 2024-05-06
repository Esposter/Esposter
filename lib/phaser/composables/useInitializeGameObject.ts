import { useInitializeGameObjectEvents } from "@/lib/phaser/composables/useInitializeGameObjectEvents";
import { useInitializeGameObjectSetters } from "@/lib/phaser/composables/useInitializeGameObjectSetters";
import { useInjectScene } from "@/lib/phaser/composables/useInjectScene";
import { onCreate } from "@/lib/phaser/hooks/onCreate";
import { onShutdown } from "@/lib/phaser/hooks/onShutdown";
import type { SetterMap } from "@/lib/phaser/models/setterMap/SetterMap";
import { useParentContainerStore } from "@/lib/phaser/store/phaser/parentContainer";
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
  const scene = useInjectScene();
  const parentContainerStore = useParentContainerStore();
  const { pushGameObject } = parentContainerStore;
  const setters = useInitializeGameObjectSetters(configuration, gameObject, emit, setterMap);
  const { initializeGameObjectEvents, unsubscribes } = useInitializeGameObjectEvents();
  pushGameObject(configuration.value, gameObject.value);

  onCreate(() => {
    for (const setter of setters) setter(gameObject.value);
    initializeGameObjectEvents(gameObject.value, emit, scene);
  }, scene.scene.key);

  onShutdown(() => {
    for (const unsubscribe of unsubscribes.value) unsubscribe();
    gameObject.value.destroy();
  }, scene.scene.key);
};
