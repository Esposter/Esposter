// One node of a rig as its Avatar asset holds it: its path from the animator's root, the index of its parent (-1 for
// The root) and its default pose, local to its parent, in the game's own left-handed axes
export interface AvatarRigNode {
  parent: number;
  path: string;
  position: [number, number, number];
  rotation: [number, number, number, number];
  scale: [number, number, number];
}
