import type { DumpedRectTransform } from "#src/models/genshinAssets/shared/DumpedRectTransform";
import type { UiCanvasScaler } from "#src/models/genshinAssets/ui/UiCanvasScaler";

// One RectTransform of a block's UI in the UI index, keyed by its block, its container and its GameObject's path ID.
// Its name is as the export holds it (a repeated name carries AnimeStudio's suffix).
// Its path is the ancestor names from its container's root down to its father.
// Its layout, its scale and its GameObject's components are its remaining fields.
// Its transform path ID and its father's and children's are what link it to the rest of its container's tree.
// Its transform and components are empty where its GameObject's dump is lost.
// That happens since AnimeStudio keeps one dump of a name.
export interface UiIndexEntry {
  block: string;
  canvas?: UiCanvasScaler;
  childIds: string[];
  components: string[];
  container: string;
  fatherId: string;
  name: string;
  path: string[];
  pathId: string;
  rect: DumpedRectTransform;
  scale: [number, number];
  transformId: string;
}
