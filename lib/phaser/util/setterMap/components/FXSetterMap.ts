import { type SetterMap } from "@/lib/phaser/models/SetterMap";
import { type GameObjects } from "phaser";

export const FXSetterMap = {
  padding: (gameObject) => (value) => gameObject.setPadding(value),
} satisfies SetterMap<GameObjects.Components.FX, GameObjects.Components.FX>;
