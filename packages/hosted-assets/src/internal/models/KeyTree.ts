// A node of the nested constant: a key's segment names either the next node or the key itself
export interface KeyTree {
  [segment: string]: KeyTree | string;
}
