// A reference from one object to another as a dump holds it: the index of the file it lies in, zero for the pointer's
// Own file and otherwise one past that file's place among its external references, and its path ID as source text
export interface ObjectPointer {
  fileIndex: number;
  pathId: string;
}
