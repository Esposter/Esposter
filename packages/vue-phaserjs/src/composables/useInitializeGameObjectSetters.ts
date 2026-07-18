import type { SetterMap } from "@/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";
import type { SetupContext, WatchHandle } from "vue";

import { useInjectSceneKey } from "@/composables/useInjectSceneKey";
import { onNextTick } from "@/hooks/onNextTick";
import { getUpdateEvent } from "@/util/emit/getUpdateEvent";

export const useInitializeGameObjectSetters = <
  TConfiguration extends object,
  TGameObject extends GameObjects.GameObject,
  TEmitsOptions extends Record<string, unknown[]>,
>(
  gameObject: () => TGameObject,
  configuration: () => TConfiguration,
  emit: SetupContext<TEmitsOptions>["emit"],
  setterMap: SetterMap<TConfiguration, TGameObject, TEmitsOptions>,
  immediate?: true,
) => {
  const sceneKey = useInjectSceneKey();
  const setters: ((gameObject: TGameObject) => void)[] = [];
  const setterWatchHandles: WatchHandle[] = [];

  for (const [key, value] of Object.entries(toValue(configuration)) as [
    keyof TConfiguration,
    TConfiguration[keyof TConfiguration],
  ][]) {
    const setter = setterMap[key];
    if (!setter) continue;
    setters.push((targetGameObject) => {
      setter(targetGameObject, emit)(value);
      if (value !== undefined) emit(getUpdateEvent(key as string), value);
      // If we haven't defined a proper value for the game object property,
      // We should emit the intrinsic gameObject value so vue can grab it
      else if (key in targetGameObject)
        emit(getUpdateEvent(key as string), targetGameObject[key as keyof typeof targetGameObject]);
    });

    setterWatchHandles.push(
      watch(
        () => toValue(configuration)[key],
        (newValue) => {
          const updater = () => {
            setter(toValue(gameObject), emit)(newValue);
            emit(getUpdateEvent(key as string), newValue);
          };
          if (immediate) updater();
          else
            onNextTick(() => {
              updater();
            }, sceneKey);
        },
        { deep: typeof toValue(configuration)[key] === "object" },
      ),
    );
  }

  const initializeGameObjectSetters = (targetGameObject: TGameObject) => {
    for (const setter of setters) setter(targetGameObject);
  };
  return { initializeGameObjectSetters, setterWatchHandles };
};
