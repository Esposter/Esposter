import type { VisibleConfiguration } from "@/models/configuration/components/VisibleConfiguration";
import type { VisibleEventEmitsOptions } from "@/models/emit/components/VisibleEventEmitsOptions";
import type { SetterMap } from "@/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

export const VisibleSetterMap = {
  visible: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setVisible(value);
  },
} as const satisfies SetterMap<VisibleConfiguration, GameObjects.Components.Visible, VisibleEventEmitsOptions>;
