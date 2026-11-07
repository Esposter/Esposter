import type { PropKind } from "#src/models/genshinAssets/props/PropKind";

// The prop kinds `fit props` fits, in the order it runs them. A kind is added by its own task, once its prefab is exported
// on the PC and its mesh is named, since no prefab's name is in the repository until then
export const PROP_KINDS: PropKind[] = [];
