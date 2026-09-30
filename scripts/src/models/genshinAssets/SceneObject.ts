// One object of a scene's dumped hierarchy: its name, the path ID of its transform and of its parent's (zero for a
// Root), and its transform's local position, rotation and scale
export interface SceneObject {
  name: string;
  parentId: string;
  position: [number, number, number];
  rotation: [number, number, number, number];
  scale: [number, number, number];
  transformId: string;
}
