// The game's character model to write as an avatar: the block and name of its Avatar asset, which holds the rig. The
// Meshes it draws are the renderers of its object tree, not a list
export interface AvatarSource {
  block: string;
  name: string;
}
