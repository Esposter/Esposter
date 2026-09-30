// What a component's exports are found by: the name pattern of its assets, the roots of the arrangements it is, and,
// For a screen with an interface, the root of its RectTransforms and the pattern of an indexed asset beside them, which
// Finds their block (GameObjects are not in the asset index), the name pattern of the animation clips it plays, and an
// Offset in the game's axes for a root whose own parent sits in a block not read, so it is dumped at the origin though
// The game places it elsewhere, solved from something it must meet
export interface DerivedAssetComponentOptions {
  clipPattern?: string;
  interface?: { anchorPattern: string; root: string };
  namePattern: string;
  rootOffsets?: Record<string, [number, number, number]>;
  roots: string[];
}
