// What a landmark is, which decides the kit that builds it. A kind is added once the reader that places its landmarks
// Exists, which can come before the kit that draws them
export const LandmarkKind = {
  Building: "Building",
  DomainEntrance: "DomainEntrance",
  Rock: "Rock",
  StatueOfTheSeven: "StatueOfTheSeven",
  TeleportWaypoint: "TeleportWaypoint",
  Tree: "Tree",
} as const;
export type LandmarkKind = (typeof LandmarkKind)[keyof typeof LandmarkKind];
