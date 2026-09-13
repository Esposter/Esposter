import type { SetterMap } from "#src/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";
import type { SetupContext, WatchHandle } from "vue";

import { useInjectSceneKey } from "#src/composables/useInjectSceneKey";
import { onNextTick } from "#src/hooks/onNextTick";
import { getUpdateEvent } from "#src/services/emit/getUpdateEvent";

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
    const updateEvent = getUpdateEvent(key as string);
    setters.push((targetGameObject) => {
      setter(targetGameObject, emit)(value);
      if (value !== undefined) emit(updateEvent, value);
      // If we haven't defined a proper value for the game object property,
      // We should emit the intrinsic gameObject value so vue can grab it
      else if (key in targetGameObject) emit(updateEvent, targetGameObject[key as keyof typeof targetGameObject]);
    });

    setterWatchHandles.push(
      watch(
        () => toValue(configuration)[key],
        (newValue, oldValue) => {
          // `deep` makes vue skip its own changed check, so a parent re-render passing a fresh configuration object
          // Would re-fire every setter with the value it already holds and overwrite whatever the game object has
          // Been given since — a frame an animation plugin is driving, say. An object is still the same reference
          // After a nested edit, so an unchanged primitive is the only one this can drop
          if (newValue === oldValue && (newValue === null || typeof newValue !== "object")) return;

          const updater = () => {
            setter(toValue(gameObject), emit)(newValue);
            emit(updateEvent, newValue);
          };
          if (immediate) updater();
          else
            onNextTick(() => {
              updater();
            }, sceneKey);
        },
        // Deep unconditionally rather than by the initial value's type: a property that starts `undefined` and is
        // Later given an object would otherwise be watched shallowly forever, so the game object would track the
        // Replacement and then silently stop tracking its nested edits. Deep on a primitive traverses nothing
        // eslint-disable-next-line no-restricted-syntax -- `watchDeep` is a Nuxt auto-import of VueUse, which a published package would have to take on as a dependency of its own
        { deep: true },
      ),
    );
  }

  const initializeGameObjectSetters = (targetGameObject: TGameObject) => {
    for (const setter of setters) setter(targetGameObject);
  };
  return { initializeGameObjectSetters, setterWatchHandles };
};
