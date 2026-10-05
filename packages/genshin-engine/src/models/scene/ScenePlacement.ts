// One part of a scene where it stands, in three's axes: the mesh it draws by name, the material each of its submeshes
// Is drawn with by its key in the layout's materials, and its position, rotation (a quaternion) and scale
export interface ScenePlacement {
  materials: string[];
  mesh: string;
  position: [number, number, number];
  rotation: [number, number, number, number];
  scale: [number, number, number];
}
