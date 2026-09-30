// One object of a scene's dumped hierarchy: its name, the block and the file (its CAB) holding it, the path ID of its transform, of its
// Parent's (zero for a root), of its children's and of its game object, the names its game object's components are dumped
// Under (a script's, an animator's controller's), and
// Its transform's local position, rotation and scale
export interface SceneObject {
  block: string;
  childIds: string[];
  components: string[];
  file: string;
  gameObjectId: string;
  name: string;
  parentId: string;
  position: [number, number, number];
  rotation: [number, number, number, number];
  scale: [number, number, number];
  transformId: string;
}
