// The game's character model to write as an avatar: the block and name of its Avatar asset, which holds the rig, and the
// Meshes of the model it draws, each named as the component's export names them
export interface AvatarSource {
  block: string;
  meshes: string[];
  name: string;
}
