import { type SetterMap } from "@/lib/phaser/models/SetterMap";
import { type GameObjects } from "phaser";

export const VisibleSetterMap = {
  visible: (gameObject) => (value) => gameObject.setVisible(value),
} satisfies SetterMap<GameObjects.Components.Visible, GameObjects.Components.Visible>;
