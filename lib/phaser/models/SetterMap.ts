import { type GameObjectEventEmitsOptions } from "@/lib/phaser/models/emit/GameObjectEventEmitsOptions";
import { type SetupContext } from "vue";

export type SetterMap<TConfiguration extends object, TGameObject extends object> = {
  [P in keyof TConfiguration]?: (
    gameObject: TGameObject,
    emit: SetupContext<GameObjectEventEmitsOptions>["emit"],
  ) => (value: TConfiguration[P]) => void;
};
