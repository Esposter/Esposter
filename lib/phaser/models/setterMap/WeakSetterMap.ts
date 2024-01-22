import { type GameObjectEventEmitsOptions } from "@/lib/phaser/models/emit/GameObjectEventEmitsOptions";
import { type SetupContext } from "vue";
// We need this weak type for the actual phaser game objects
// as the component types are very strong and the game object configuration types
// don't really conform to the types specified by the separate component parts.
// However, we can be sure that it will work fine regardless as we build
// the game object setter map purely based off spreading all the relevant component parts
// and some specific custom setters.
export type WeakSetterMap<TConfiguration extends object, TGameObject extends object> = {
  [P in keyof TConfiguration]?: (
    gameObject: TGameObject,
    emit: SetupContext<GameObjectEventEmitsOptions>["emit"],
  ) => (value: any) => void;
};
