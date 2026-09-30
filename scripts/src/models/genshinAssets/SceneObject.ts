// One object of a scene's dumped hierarchy: its name, the block and the file (its CAB) holding it, the path ID of its
// Transform, of its parent's (zero for a root) with the file its parent lies in (its own, but for a spawned prefab's
// Root), of its children's and of its game object, the names its game object's components are dumped under (a
// Script's, an animator's controller's), and its transform's local position, rotation and scale
export interface SceneObject {
  block: string;
  childIds: string[];
  components: string[];
  file: string;
  gameObjectId: string;
  name: string;
  parentFile: string;
  parentId: string;
  position: [number, number, number];
  rotation: [number, number, number, number];
  scale: [number, number, number];
  transformId: string;
}
