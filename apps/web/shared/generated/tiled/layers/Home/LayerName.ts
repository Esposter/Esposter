export const LayerName = {
  Boulder: "Boulder",
  Building: "Building",
  Collision: "Collision",
  Decoration: "Decoration",
  Encounter: "Encounter",
  Fence: "Fence",
  Foreground: "Foreground",
  Ground: "Ground",
  Sign: "Sign",
  TreeBottom: "TreeBottom",
  TreeTop: "TreeTop",
  Water: "Water",
} as const;
export type LayerName = (typeof LayerName)[keyof typeof LayerName];
