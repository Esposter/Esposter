// One object of a scene's dumped hierarchy: its name, the block holding it, the path ID of its transform, of its
// Parent's (zero for a root), of its children's and of its game object, the names of its game object's scripts, and
// Its transform's local position, rotation and scale
export interface SceneObject {
  block: string;
  childIds: string[];
  gameObjectId: string;
  name: string;
  parentId: string;
  position: [number, number, number];
  rotation: [number, number, number, number];
  scale: [number, number, number];
  scripts: string[];
  transformId: string;
}
