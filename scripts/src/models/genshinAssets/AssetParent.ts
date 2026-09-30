// A parent a root hangs from in the game but that sits in a block not read: where it stands in the game's own axes, and
// Its uniform scale, which reaches its children as Unity composes a Transform
export interface AssetParent {
  position: [number, number, number];
  scale: number;
}
