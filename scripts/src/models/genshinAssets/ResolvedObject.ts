// An object a pointer names, held as a path ID names it, within its file: the file (its CAB, lowercase), the block
// Holding that file, and the path ID
export interface ResolvedObject {
  block: string;
  file: string;
  pathId: string;
}
