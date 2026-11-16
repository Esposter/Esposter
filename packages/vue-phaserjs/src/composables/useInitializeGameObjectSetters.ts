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
  checkIsUnmounted: () => boolean,
  immediate?: true,
) => {
  const sceneKey = useInjectSceneKey();
  const setters: ((gameObject: TGameObject) => void)[] = [];
  const setterWatchHandles: WatchHandle[] = [];

  const initialConfiguration = toValue(configuration);
  // Every property the game object has a setter for is watched, whether the configuration sets it, leaves it out or
  // Hands it undefined, so a property given only later still reaches the game object
  for (const key in setterMap) {
    if (!Object.hasOwn(setterMap, key)) continue;
    const setter = setterMap[key];
    if (!setter) continue;
    const value = initialConfiguration[key];
    const updateEvent = getUpdateEvent(key);
    // A property with no value reports the game object's own, so a parent binding it with v-model still reads one
    const emitOwnValue = (targetGameObject: TGameObject) => {
      if (key in targetGameObject) emit(updateEvent, targetGameObject[key as keyof typeof targetGameObject]);
    };
    // The one path a value takes into the game object on each update, so the parent hears the same either way
    const applyValue = (targetGameObject: TGameObject, nextValue: TConfiguration[typeof key] | undefined) => {
      setter(targetGameObject, emit)(nextValue);
      if (nextValue === undefined) emitOwnValue(targetGameObject);
      else emit(updateEvent, nextValue);
    };
    // At setup a property with no value, left out or undefined alike, leaves the game object as Phaser created it
    setters.push((targetGameObject) => {
      if (value === undefined) emitOwnValue(targetGameObject);
      else applyValue(targetGameObject, value);
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
            // A value queued before unmount must not reach the game object the unmount destroyed
            if (checkIsUnmounted()) return;

            applyValue(toValue(gameObject), newValue);
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
