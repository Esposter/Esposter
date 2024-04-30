import { useInitializeGameObjectEvents } from "@/lib/phaser/composables/useInitializeGameObjectEvents";
import { useInitializeGameObjectSetters } from "@/lib/phaser/composables/useInitializeGameObjectSetters";
import type { SetterMap } from "@/lib/phaser/models/setterMap/SetterMap";
import { usePhaserStore } from "@/lib/phaser/store/phaser";
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
  const phaserStore = usePhaserStore();
  const { scene } = storeToRefs(phaserStore);
  const parentContainerStore = useParentContainerStore();
  const { pushGameObject } = parentContainerStore;
  const setters = useInitializeGameObjectSetters(configuration, gameObject, emit, setterMap);
  const { initializeGameObjectEvents, unsubscribes } = useInitializeGameObjectEvents();
  pushGameObject(configuration.value, gameObject.value);

  onMounted(() => {
    for (const setter of setters) setter(gameObject.value);
    initializeGameObjectEvents(gameObject.value, emit, scene.value);
  });

  onUnmounted(() => {
    for (const unsubscribe of unsubscribes.value) unsubscribe();
    gameObject.value.destroy();
  });
};
