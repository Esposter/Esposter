import type { SetterMap } from "@/lib/phaser/models/setterMap/SetterMap";
import { getUpdateEvent } from "@/lib/phaser/util/emit/getUpdateEvent";
import type { GameObjects } from "phaser";
import type { SetupContext, WatchStopHandle } from "vue";

export const useInitializeGameObjectSetters = <
  TConfiguration extends object,
  TGameObject extends GameObjects.GameObject,
  TEmitsOptions extends Record<string, unknown[]>,
>(
  configuration: () => TConfiguration,
  emit: SetupContext<TEmitsOptions>["emit"],
  setterMap: SetterMap<TConfiguration, TGameObject, TEmitsOptions>,
) => {
  const setterStopHandlers: WatchStopHandle[] = [];
  const initializeGameObjectSetters = (gameObject: TGameObject) => {
    const setters: ((gameObject: TGameObject) => void)[] = [];

    for (const [key, value] of Object.entries(toValue(configuration)) as [
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

      setterStopHandlers.push(
        watch(
          () => toValue(configuration)[key],
          (newValue) => {
            setter(gameObject, emit)(newValue);
            emit(getUpdateEvent(key as string), newValue);
          },
          { deep: typeof toValue(configuration)[key] === "object" },
        ),
      );
    }

    for (const setter of setters) setter(gameObject);
  };
  return { initializeGameObjectSetters, setterStopHandlers };
};
