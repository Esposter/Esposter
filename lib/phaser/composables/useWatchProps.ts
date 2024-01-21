import { type SetterMap } from "@/lib/phaser/models/SetterMap";
import { type GameObjects } from "phaser";
import { type WatchStopHandle } from "vue";

export const useWatchProps = <TConfig extends object, TGameObject extends GameObjects.GameObject>(
  gameObject: TGameObject,
  props: Ref<TConfig>,
  setterMap: SetterMap<TConfig, TGameObject>,
) => {
  const watchStopHandlers: WatchStopHandle[] = [];

  for (const [key, value] of Object.entries(props.value) as [keyof TConfig, unknown][]) {
    const setter = setterMap[key]?.(gameObject);
    if (!setter) continue;

    setter(value);
    watchStopHandlers.push(watch(() => props.value[key], setter, { deep: typeof props.value[key] === "object" }));
  }

  onBeforeUnmount(() => {
    for (const watchStopHandler of watchStopHandlers) watchStopHandler();
  });
};
