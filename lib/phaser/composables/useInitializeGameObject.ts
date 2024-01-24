import { type GameObjectEventEmitsOptions } from "@/lib/phaser/models/emit/GameObjectEventEmitsOptions";
import { type SetterMap } from "@/lib/phaser/models/setterMap/SetterMap";
import { useParentContainerStore } from "@/lib/phaser/store/parentContainer";
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { GameObjectEventMap } from "@/lib/phaser/util/emit/GameObjectEventMap";
import { type GameObjects, type Types } from "phaser";
import { type SetupContext, type WatchStopHandle } from "vue";

export const useInitializeGameObject = <TConfiguration extends object, TGameObject extends GameObjects.GameObject>(
  init: (configuration: TConfiguration) => TGameObject,
  configuration: Ref<TConfiguration>,
  emit: SetupContext<GameObjectEventEmitsOptions>["emit"],
  setterMap: SetterMap<TConfiguration, TGameObject>,
) => {
  const phaserStore = usePhaserStore();
  const { scene } = storeToRefs(phaserStore);
  const parentContainerStore = useParentContainerStore();
  const { pushGameObject } = parentContainerStore;
  // @TODO: Vue cannot unwrap generic refs yet
  const gameObject = ref(null) as Ref<TGameObject | null>;
  const watchStopHandlers: WatchStopHandle[] = [];
  const settersWithValues: [
    setter: NonNullable<SetterMap<TConfiguration, TGameObject>[keyof TConfiguration]>,
    value: TConfiguration[keyof TConfiguration],
  ][] = [];

  for (const [key, value] of Object.entries(configuration.value) as [
    keyof TConfiguration,
    TConfiguration[keyof TConfiguration],
  ][]) {
    const setter = setterMap[key];
    if (!setter) continue;

    settersWithValues.push([setter, value]);
    watchStopHandlers.push(
      watch(
        () => configuration.value[key],
        (newValue) => {
          if (!gameObject.value) return;
          setter(gameObject.value, emit)(newValue);
        },
        { deep: typeof configuration.value[key] === "object" },
      ),
    );
  }

  onMounted(() => {
    gameObject.value = init(configuration.value);
    pushGameObject(configuration.value, gameObject.value);

    for (const [setter, value] of settersWithValues) setter(gameObject.value, emit)(value);
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
        // @ts-expect-error
        // emit has a bunch of different overload types which doesn't match our union type
        // but we know that our union type matches the game object events since we're just passing in the same events
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
