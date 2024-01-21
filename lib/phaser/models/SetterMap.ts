import { type GameObjects } from "phaser";

export type SetterMap<TConfig extends object, TGameObject extends GameObjects.GameObject> = {
  [P in keyof TConfig]?: (gameObject: TGameObject) => (value: any) => void;
};
