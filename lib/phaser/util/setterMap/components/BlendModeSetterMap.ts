import { type BlendModeConfiguration } from "@/lib/phaser/models/configuration/components/BlendModeConfiguration";
import { type SetterMap } from "@/lib/phaser/models/setterMap/SetterMap";
import { type GameObjects } from "phaser";

export const BlendModeSetterMap = {
  blendMode: (gameObject) => (value) => gameObject.setBlendMode(value),
} satisfies SetterMap<BlendModeConfiguration, GameObjects.Components.BlendMode>;
