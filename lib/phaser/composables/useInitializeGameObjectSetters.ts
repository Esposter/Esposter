import { type SetterMap } from "@/lib/phaser/models/setterMap/SetterMap";
import { getUpdateEvent } from "@/lib/phaser/util/emit/getUpdateEvent";
import { type GameObjects } from "phaser";
import { type SetupContext, type WatchStopHandle } from "vue";

export const useInitializeGameObjectSetters = <
  TConfiguration extends object,
  TGameObject extends GameObjects.GameObject,
  TEmitsOptions extends Record<string, any[]>,
>(
  configuration: Ref<TConfiguration>,
  gameObject: Ref<TGameObject | null>,
  emit: SetupContext<TEmitsOptions>["emit"],
  setterMap: SetterMap<TConfiguration, TGameObject, TEmitsOptions>,
) => {
  const setters: ((gameObject: TGameObject) => void)[] = [];
  const watchStopHandlers: WatchStopHandle[] = [];

  for (const [key, value] of Object.entries(configuration.value) as [
    keyof TConfiguration,
    TConfiguration[keyof TConfiguration],
  ][]) {
    const setter = setterMap[key];
    if (!setter) continue;

    const setterWithEmit = (gameObject: TGameObject, newValue: TConfiguration[keyof TConfiguration]) => {
      setter(gameObject, emit)(newValue);
      emit(getUpdateEvent(key as string), newValue);
    };
    setters.push((gameObject) => setterWithEmit(gameObject, value));
    watchStopHandlers.push(
      watch(
        () => configuration.value[key],
        (newValue) => {
          if (!gameObject.value) return;
          setterWithEmit(gameObject.value, newValue);
        },
        { deep: typeof configuration.value[key] === "object" },
      ),
    );
  }

  onBeforeUnmount(() => {
    for (const watchStopHandler of watchStopHandlers) watchStopHandler();
  });

  return setters;
};
