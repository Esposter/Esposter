import { type SetterMap } from "@/lib/phaser/models/setterMap/SetterMap";
import { type GameObjects } from "phaser";

export const BlendModeSetterMap = {
  blendMode: (gameObject) => (value) => gameObject.setBlendMode(value),
} satisfies SetterMap<GameObjects.Components.BlendMode, GameObjects.Components.BlendMode>;
