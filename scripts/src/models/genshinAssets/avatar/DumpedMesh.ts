// A mesh as its JSON dump holds it, in the game's own left-handed axes: its vertex attributes flat, its index buffer, its
// Submeshes' index counts, its skin per vertex and the hash of each bone its skin names
export interface DumpedMesh {
  m_BoneNameHashes: number[];
  m_Colors: number[];
  m_Indices: number[];
  m_Normals: number[];
  m_Skin: { boneIndex: number[]; weight: number[] }[];
  m_SubMeshes: { indexCount: number }[];
  m_Tangents: number[];
  m_UV0: number[];
  m_VertexCount: number;
  m_Vertices: number[];
}
