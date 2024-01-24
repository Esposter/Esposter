import { type SetterMap } from "@/lib/phaser/models/setterMap/SetterMap";
import { useParentContainerStore } from "@/lib/phaser/store/parentContainer";
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { GameObjectEventMap } from "@/lib/phaser/util/emit/GameObjectEventMap";
import { getUpdateEvent } from "@/lib/phaser/util/emit/getUpdateEvent";
import { type GameObjects, type Types } from "phaser";
import { type SetupContext, type WatchStopHandle } from "vue";

export const useInitializeGameObject = <
  TConfiguration extends object,
  TGameObject extends GameObjects.GameObject,
  TEmitsOptions extends Record<string, any[]>,
>(
  init: (configuration: TConfiguration) => TGameObject,
  configuration: Ref<TConfiguration>,
  emit: SetupContext<TEmitsOptions>["emit"],
  setterMap: SetterMap<TConfiguration, TGameObject, TEmitsOptions>,
) => {
  const phaserStore = usePhaserStore();
  const { scene } = storeToRefs(phaserStore);
  const parentContainerStore = useParentContainerStore();
  const { pushGameObject } = parentContainerStore;
  // @TODO: Vue cannot unwrap generic refs yet
  const gameObject = ref(null) as Ref<TGameObject | null>;
  const watchStopHandlers: WatchStopHandle[] = [];
  const setters: ((gameObject: TGameObject) => void)[] = [];

  for (const [key, value] of Object.entries(configuration.value) as [
    keyof TConfiguration,
    TConfiguration[keyof TConfiguration],
  ][]) {
    const setter = setterMap[key];
    if (!setter) continue;

    setters.push((gameObject) => {
      setter(gameObject, emit)(value);
      emit(getUpdateEvent(key as string));
    });
    watchStopHandlers.push(
      watch(
        () => configuration.value[key],
        (newValue) => {
          if (!gameObject.value) return;
          setter(gameObject.value, emit)(newValue);
          emit(getUpdateEvent(key as string));
        },
        { deep: typeof configuration.value[key] === "object" },
      ),
    );
  }

  onMounted(() => {
    gameObject.value = init(configuration.value);
    pushGameObject(configuration.value, gameObject.value);

    for (const setter of setters) setter(gameObject.value);
    // Set events
    const events = Object.keys(GameObjectEventMap).filter(
      (key) => key in configuration.value,
    ) as (keyof typeof GameObjectEventMap)[];

    if (events.length === 0) return;

    if (!gameObject.value.input) gameObject.value.setInteractive();
    if (events.some((key) => "drag" in GameObjectEventMap[key])) scene.value.input.setDraggable(gameObject.value);

    for (const event of events) {
      const context = GameObjectEventMap[event];
      gameObject.value.on(event, (...args: Types.Input.EventData[]) => {
        if ("eventIndex" in context) args[0].stopPropagation = args[context.eventIndex].stopPropagation;
        emit(event, ...args);
      });
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
