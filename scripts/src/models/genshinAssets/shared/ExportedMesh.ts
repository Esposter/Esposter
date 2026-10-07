// A mesh as AnimeStudio exports it as JSON, as far as it is read: each vertex's bones and their weights, in the Order
// The OBJ beside it holds its vertices, each bone's bind pose (a matrix whose fields are named by column, then Row) and
// The CRC32 of each bone's path, which a clip's bindings name it by; and its vertices' positions, normals and first
// Three sets of texture coordinates flattened, in the game's own axes, a set the mesh lacks null
export interface ExportedMesh {
  m_BindPose: Record<`M${MatrixIndex}${MatrixIndex}`, number>[];
  m_BoneNameHashes: number[];
  m_Normals: number[];
  m_Skin: { boneIndex: number[]; weight: number[] }[];
  m_UV0: null | number[];
  m_UV1: null | number[];
  m_UV2: null | number[];
  m_Vertices: number[];
}
type MatrixIndex = 0 | 1 | 2 | 3;
