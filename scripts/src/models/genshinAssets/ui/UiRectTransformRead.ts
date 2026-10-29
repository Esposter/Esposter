import type { DumpedRectTransform } from "#src/models/genshinAssets/shared/DumpedRectTransform";

// A RectTransform as its JSON and raw exports give it, joined by its GameObject's path ID: the container its files are
// grouped under, its GameObject's name, its father's and its children's transform path IDs, its scale and its layout
export interface UiRectTransformRead {
  childIds: string[];
  container: string;
  fatherId: string;
  gameObjectId: string;
  layout: DumpedRectTransform;
  name: string;
  scale: [number, number];
}
