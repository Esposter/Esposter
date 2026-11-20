// An OBJ's vertex positions and normals, its triangles as indices into them, the group each triangle is drawn in (a
// Submesh, one material each), its texture coordinates and each triangle's as indices into them, and each corner's
// Normal as an index into the normals
export interface ObjMesh {
  faceGroups: string[];
  faceNormals: [number, number, number][];
  faces: [number, number, number][];
  faceUvs: [number, number, number][];
  normals: [number, number, number][];
  uvs: [number, number][];
  vertices: [number, number, number][];
}
