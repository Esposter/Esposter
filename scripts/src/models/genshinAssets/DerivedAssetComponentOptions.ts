// What a component's exports are found by: the name pattern of its assets, the roots of the arrangements it is, and,
// For a screen with an interface, the root of its RectTransforms and the pattern of an indexed asset beside them, which
// Finds their block (GameObjects are not in the asset index), and the name pattern of the animation clips it plays
export interface DerivedAssetComponentOptions {
  clipPattern?: string;
  interface?: { anchorPattern: string; root: string };
  namePattern: string;
  roots: string[];
}
