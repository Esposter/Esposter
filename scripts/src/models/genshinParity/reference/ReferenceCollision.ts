// A reference id whose screenshot packs to other bytes than the committed manifest row for it holds.
// It carries the hash of the bytes the screenshot packs to, and the hash of the committed ones it differs from
export interface ReferenceCollision {
  committed: string;
  id: string;
  ours: string;
}
