import type { DumpedRectTransform } from "#src/models/genshinAssets/DumpedRectTransform";

// A RectTransform as its dumps give it: its GameObject's path ID and name, its father's and its children's transform
// Path IDs, its scale, and its layout from its raw export
export interface DumpedInterfaceRect {
  childIds: string[];
  fatherId: string;
  gameObjectId: string;
  layout: DumpedRectTransform;
  name: string;
  scale: [number, number];
}
