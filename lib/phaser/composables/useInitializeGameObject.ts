import { useInitializeGameObjectSetters } from "@/lib/phaser/composables/useInitializeGameObjectSetters";
import { type SetterMap } from "@/lib/phaser/models/setterMap/SetterMap";
import { useParentContainerStore } from "@/lib/phaser/store/parentContainer";
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { initializeGameObjectEvents } from "@/lib/phaser/util/emit/initializeGameObjectEvents";
import { type GameObjects } from "phaser";
import { type SetupContext } from "vue";

export const useInitializeGameObject = <
  TConfiguration extends object,
  TGameObject extends GameObjects.GameObject,
  TEmitsOptions extends Record<string, any[]>,
>(
  init: (configuration: TConfiguration) => TGameObject,
  configuration: Ref<TConfiguration>,
  emit: SetupContext<TEmitsOptions>["emit"],
  setterMap: SetterMap<TConfiguration, TGameObject, TEmitsOptions>,
) => {
  const phaserStore = usePhaserStore();
  const { scene } = storeToRefs(phaserStore);
  const parentContainerStore = useParentContainerStore();
  const { pushGameObject } = parentContainerStore;
  // @TODO: Vue cannot unwrap generic refs yet
  const gameObject = ref(null) as Ref<TGameObject | null>;
  const setters = useInitializeGameObjectSetters(configuration, gameObject, emit, setterMap);

  onMounted(() => {
    gameObject.value = init(configuration.value);
    pushGameObject(configuration.value, gameObject.value);
    for (const setter of setters) setter(gameObject.value);
    initializeGameObjectEvents(configuration.value, gameObject.value, emit, scene.value);
  });

  onBeforeUnmount(() => {
    if (!gameObject.value) return;
    gameObject.value.destroy();
    gameObject.value = null;
  });

  return gameObject;
};
