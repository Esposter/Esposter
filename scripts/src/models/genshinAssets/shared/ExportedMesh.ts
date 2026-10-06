// A mesh as AnimeStudio exports it as JSON, as far as its skin is read: each vertex's bones and their weights, in the
// Order the OBJ beside it holds its vertices, each bone's bind pose (a matrix whose fields are named by column, then
// Row) and the CRC32 of each bone's path, which a clip's bindings name it by
export interface ExportedMesh {
  m_BindPose: Record<`M${MatrixIndex}${MatrixIndex}`, number>[];
  m_BoneNameHashes: number[];
  m_Skin: { boneIndex: number[]; weight: number[] }[];
}
type MatrixIndex = 0 | 1 | 2 | 3;
