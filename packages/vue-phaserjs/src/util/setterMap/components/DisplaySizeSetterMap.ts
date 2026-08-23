import type { ComputedSizeConfiguration } from "#src/models/configuration/components/ComputedSizeConfiguration";
import type { ComputedSizeEventEmitsOptions } from "#src/models/emit/components/ComputedSizeEventEmitsOptions";
import type { SetterMap } from "#src/models/setterMap/SetterMap";
// Only requires setDisplaySize so it is reusable by shapes (e.g. Arc, Star) that have no setSize. The game object
// Is typed structurally (setDisplaySize returning unknown) because Pick<ComputedSize, ...> pins the method's `this`
// Return type to ComputedSize, which shapes without setSize can never satisfy.
export const DisplaySizeSetterMap = {
  displayHeight: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setDisplaySize(gameObject.displayWidth, value);
  },
  displayWidth: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setDisplaySize(value, gameObject.displayHeight);
  },
} as const satisfies SetterMap<
  Pick<ComputedSizeConfiguration, "displayHeight" | "displayWidth">,
  { displayHeight: number; displayWidth: number; setDisplaySize: (width: number, height: number) => unknown },
  ComputedSizeEventEmitsOptions
>;
