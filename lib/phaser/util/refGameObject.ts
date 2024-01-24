import { GAME_OBJECT_KEY } from "@/lib/phaser/util/constants";
import { type GameObjects } from "phaser";

export const refGameObject = <TGameObject extends GameObjects.GameObject>(value?: TGameObject | null) =>
  customRef((track, trigger) => ({
    get() {
      track();
      return value;
    },
    set(newValue) {
      // @TODO: https://github.com/vuejs/rfcs/discussions/558
      const assertedValue = newValue as unknown as { [GAME_OBJECT_KEY]: TGameObject | null };
      if (value && assertedValue) return;
      value = assertedValue?.[GAME_OBJECT_KEY] ?? null;
      trigger();
    },
  }));
