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
  gameObject: Ref<TGameObject>,
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

    setters.push((gameObject) => {
      setter(gameObject, emit)(value);
      if (value !== undefined) emit(getUpdateEvent(key as string), value);
      // If we haven't defined a proper value for the game object property,
      // we should emit the intrinsic gameObject value so vue can grab it
      else if (key in gameObject) emit(getUpdateEvent(key as string), gameObject[key as keyof typeof gameObject]);
    });
    watchStopHandlers.push(
      watch(
        () => configuration.value[key],
        (newValue) => {
          setter(gameObject.value, emit)(newValue);
          emit(getUpdateEvent(key as string), newValue);
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
