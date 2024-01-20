import { type GameObjects } from "phaser";

export type SetterMap<TConfig extends Record<string, unknown>, TGameObject extends GameObjects.GameObject> = {
  [P in keyof TConfig]?: (gameObject: TGameObject) => (value: any) => void;
};
