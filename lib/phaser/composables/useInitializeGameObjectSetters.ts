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

    const initializeSetter = (gameObject: TGameObject, newValue: TConfiguration[keyof TConfiguration]) => {
      setter(gameObject, emit)(newValue);
      if (newValue) emit(getUpdateEvent(key as string), newValue);
      // If we haven't defined a proper value for the game object property,
      // we should emit the intrinsic gameObject value so vue can grab it
      else if (key in gameObject) emit(getUpdateEvent(key as string), gameObject[key as keyof typeof gameObject]);
    };
    setters.push((gameObject) => initializeSetter(gameObject, value));

    const watchSetter = (gameObject: TGameObject, newValue: TConfiguration[keyof TConfiguration]) => {
      setter(gameObject, emit)(newValue);
      emit(getUpdateEvent(key as string), newValue);
    };
    watchStopHandlers.push(
      watch(
        () => configuration.value[key],
        (newValue) => {
          if (!gameObject.value) return;
          watchSetter(gameObject.value, newValue);
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
