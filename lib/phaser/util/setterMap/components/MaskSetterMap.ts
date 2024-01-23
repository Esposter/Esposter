import { type MaskConfiguration } from "@/lib/phaser/models/configuration/components/MaskConfiguration";
import { type SetterMap } from "@/lib/phaser/models/setterMap/SetterMap";
import { type GameObjects } from "phaser";

export const MaskSetterMap = {
  mask: (gameObject) => (value) => {
    if (!value) return;
    gameObject.setMask(value);
  },
} satisfies SetterMap<MaskConfiguration, GameObjects.Components.Mask>;
