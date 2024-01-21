import { type SetterMap } from "@/lib/phaser/models/SetterMap";
import { type GameObjects } from "phaser";
import { type WatchStopHandle } from "vue";

export const initializeGameObject = <TConfig extends object, TGameObject extends GameObjects.GameObject>(
  init: (configuration: TConfig) => TGameObject,
  configuration: Ref<TConfig>,
  setterMap: SetterMap<TConfig, TGameObject>,
) => {
  // @TODO: Vue cannot unwrap generic refs yet
  const gameObject = ref(null) as Ref<TGameObject | null>;
  const watchStopHandlers: WatchStopHandle[] = [];
  const settersWithValues: [setter: NonNullable<SetterMap<TConfig, TGameObject>[keyof TConfig]>, value: unknown][] = [];

  for (const [key, value] of Object.entries(configuration.value) as [keyof TConfig, unknown][]) {
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
    for (const [setter, value] of settersWithValues) setter(gameObject.value)(value);
  });

  onBeforeUnmount(() => {
    for (const watchStopHandler of watchStopHandlers) watchStopHandler();

    if (!gameObject.value) return;
    gameObject.value.destroy();
    gameObject.value = null;
  });

  return gameObject;
};
