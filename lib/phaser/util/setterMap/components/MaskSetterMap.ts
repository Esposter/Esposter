import { type SetterMap } from "@/lib/phaser/models/SetterMap";
import { type GameObjects } from "phaser";

export const MaskSetterMap = {
  mask: (gameObject) => (value) => gameObject.setMask(value),
} satisfies SetterMap<GameObjects.Components.Mask, GameObjects.Components.Mask>;
