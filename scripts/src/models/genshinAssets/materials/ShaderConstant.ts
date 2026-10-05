// A shader's constant buffer layouts as its raw export holds them, each a run of parameter records laid end to end: a
// Record is its name's length, its name padded to four bytes, then six fields (an index, its rows, its columns, a
// Flag, its array length and its byte offset in its buffer). Every program variant carries its own, ahead of the
// Compiled programs, listing only the parameters it reads
export interface ShaderConstant {
  arrayLength: number;
  byteOffset: number;
  columns: number;
  name: string;
  rows: number;
}
