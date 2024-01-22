import { type WeakSetterMap } from "@/lib/phaser/models/WeakSetterMap";
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { type GameObjects } from "phaser";
import { type EmitsOptions, type SetupContext, type WatchStopHandle } from "vue";

export const useInitializeGameObject = <
  TConfiguration extends object,
  TGameObject extends GameObjects.GameObject,
  TEmitsOptions extends EmitsOptions = EmitsOptions,
>(
  init: (configuration: TConfiguration) => TGameObject,
  configuration: Ref<TConfiguration>,
  setterMap: WeakSetterMap<TConfiguration, TGameObject, TEmitsOptions>,
  emit?: SetupContext<TEmitsOptions>["emit"],
) => {
  const phaserStore = usePhaserStore();
  const { parentContainer } = storeToRefs(phaserStore);
  // @TODO: Vue cannot unwrap generic refs yet
  const gameObject = ref(null) as Ref<TGameObject | null>;
  const watchStopHandlers: WatchStopHandle[] = [];
  const settersWithValues: [
    setter: NonNullable<WeakSetterMap<TConfiguration, TGameObject>[keyof TConfiguration]>,
    value: TConfiguration[keyof TConfiguration],
  ][] = [];

  for (const [key, value] of Object.entries(configuration.value) as [
    keyof TConfiguration,
    TConfiguration[keyof TConfiguration],
  ][]) {
    const setter = setterMap[key];
    if (!setter) continue;

    settersWithValues.push([setter, value]);
    watchStopHandlers.push(
      watch(
        () => configuration.value[key],
        (newValue) => {
          if (!gameObject.value) return;
          setter(gameObject.value)(newValue);
        },
        { deep: typeof configuration.value[key] === "object" },
      ),
    );
  }

  onMounted(() => {
    gameObject.value = init(configuration.value);
    for (const [setter, value] of settersWithValues) setter(gameObject.value, emit)(value);
    if (parentContainer.value) {
      const i = parentContainer.value.list.findIndex(
        (obj) =>
          "depth" in obj &&
          typeof obj.depth === "number" &&
          "depth" in configuration.value &&
          typeof configuration.value.depth === "number" &&
          obj.depth > configuration.value.depth,
      );
      i === -1 ? parentContainer.value.add(gameObject.value) : parentContainer.value.addAt(gameObject.value, i);
    }
  });

  onBeforeUnmount(() => {
    for (const watchStopHandler of watchStopHandlers) watchStopHandler();

    if (!gameObject.value) return;
    gameObject.value.destroy();
    gameObject.value = null;
  });

  return gameObject;
};
