import type { FXConfiguration } from "@/models/configuration/components/FXConfiguration";
import type { FXEventEmitsOptions } from "@/models/emit/components/FXEventEmitsOptions";
import type { SetterMap } from "@/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

export const FXSetterMap = {
  padding: (gameObject) => (value) => gameObject.setPadding(value),
} as const satisfies SetterMap<FXConfiguration, GameObjects.Components.FX, FXEventEmitsOptions>;
