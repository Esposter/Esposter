import { useInitializeGameObjectSetters } from "@/lib/phaser/composables/useInitializeGameObjectSetters";
import type { SetterMap } from "@/lib/phaser/models/setterMap/SetterMap";
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { useParentContainerStore } from "@/lib/phaser/store/phaser/parentContainer";
import { initializeGameObjectEvents } from "@/lib/phaser/util/emit/initializeGameObjectEvents";
import type { GameObjects } from "phaser";
import type { SetupContext } from "vue";

export const useInitializeGameObject = <
  TConfiguration extends object,
  TGameObject extends GameObjects.GameObject,
  TEmitsOptions extends Record<string, any[]>,
>(
  gameObject: Ref<TGameObject>,
  configuration: Ref<TConfiguration>,
  emit: SetupContext<TEmitsOptions>["emit"],
  setterMap: SetterMap<TConfiguration, TGameObject, TEmitsOptions>,
) => {
  const setters = useInitializeGameObjectSetters(configuration, gameObject, emit, setterMap);
  const phaserStore = usePhaserStore();
  const { scene } = storeToRefs(phaserStore);
  const parentContainerStore = useParentContainerStore();
  const { pushGameObject } = parentContainerStore;
  pushGameObject(configuration.value, gameObject.value);

  onMounted(() => {
    for (const setter of setters) setter(gameObject.value);
    initializeGameObjectEvents(gameObject.value, emit, scene.value);
  });

  onUnmounted(() => {
    gameObject.value.destroy();
  });
};
