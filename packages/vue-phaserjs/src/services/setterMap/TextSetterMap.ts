import type { TextConfiguration } from "#src/models/configuration/TextConfiguration";
import type { TextEventEmitsOptions } from "#src/models/emit/TextEventEmitsOptions";
import type { SetterMap } from "#src/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { ComputedSizeSetterMap } from "#src/services/setterMap/components/ComputedSizeSetterMap";
import { FlipSetterMap } from "#src/services/setterMap/components/FlipSetterMap";
import { RenderableSetterMap } from "#src/services/setterMap/shared/RenderableSetterMap";

export const TextSetterMap: SetterMap<TextConfiguration, GameObjects.Text, TextEventEmitsOptions> = {
  padding: (gameObject) => (value) => {
    if (!value) return;
    gameObject.setPadding(value);
  },
  style: (gameObject) => (value) => {
    if (!value) return;
    gameObject.setStyle(value);
  },
  text: (gameObject, emit) => (value) => {
    if (value === undefined) return;
    // Setting the text changes the derived width values too, and vue cannot see a phaser property change,
    // So they are emitted back explicitly
    gameObject.setText(value);
    emit("update:width", gameObject.width);
    emit("update:displayWidth", gameObject.displayWidth);
  },
  ...RenderableSetterMap,
  ...ComputedSizeSetterMap,
  ...FlipSetterMap,
};
