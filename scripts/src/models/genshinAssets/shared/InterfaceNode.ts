import type { DumpedRectTransform } from "#src/models/genshinAssets/shared/DumpedRectTransform";
import type { UiCanvasScaler } from "#src/models/genshinAssets/ui/UiCanvasScaler";

// One piece of a screen's interface as the game lays it out: its GameObject's name, its path from the interface's root.
// It also has its layout, its scale, and the names of its GameObject's other components (a Button, an Image, a script).
// It holds a canvas scaler where it has one, and its children are the pieces under it, in the order the game draws them
export interface InterfaceNode extends DumpedRectTransform {
  canvas?: UiCanvasScaler;
  children: InterfaceNode[];
  components: string[];
  name: string;
  path: string;
  scale: [number, number];
}
