import { type FXConfiguration } from "@/lib/phaser/models/configuration/components/FXConfiguration";
import { type FXEventEmitsOptions } from "@/lib/phaser/models/emit/components/FXEventEmitsOptions";
import { type SetterMap } from "@/lib/phaser/models/setterMap/SetterMap";
import { type GameObjects } from "phaser";

export const FXSetterMap = {
  padding: (gameObject) => (value) => gameObject.setPadding(value),
} satisfies SetterMap<FXConfiguration, GameObjects.Components.FX, FXEventEmitsOptions>;
