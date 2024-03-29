import type { VisibleConfiguration } from "@/lib/phaser/models/configuration/components/VisibleConfiguration";
import type { VisibleEventEmitsOptions } from "@/lib/phaser/models/emit/components/VisibleEventEmitsOptions";
import type { SetterMap } from "@/lib/phaser/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

export const VisibleSetterMap = {
  visible: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setVisible(value);
  },
} as const satisfies SetterMap<VisibleConfiguration, GameObjects.Components.Visible, VisibleEventEmitsOptions>;
