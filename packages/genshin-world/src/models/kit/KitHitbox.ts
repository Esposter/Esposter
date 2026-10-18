// A reach set about the enemy a hit lands on, not the body: a circle, or a box whose width runs along x and whose length
// Runs along z, its centre offset from that enemy in the world's axes, as gcsim's on-target hitboxes are, since an enemy
// Keeps its default facing
export interface KitHitbox {
  offset: { x: number; z: number };
  shape: { kind: "box"; length: number; width: number } | { kind: "circle"; radius: number };
}
