import type { DumpedRectTransform } from "#src/models/genshinAssets/shared/DumpedRectTransform";

// One piece of a screen's interface as the game lays it out: its GameObject's name, its path from the interface's root,
// Its layout, its scale, the names of its GameObject's other components (a Button, an Image, a script), and the pieces
// Under it in the order the game draws them
export interface InterfaceNode extends DumpedRectTransform {
  children: InterfaceNode[];
  components: string[];
  name: string;
  path: string;
  scale: [number, number];
}
