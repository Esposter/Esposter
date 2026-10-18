// One row of the layers tree: a node's depth below the root's content, its JSON Pointer and its type
export interface BlockLayerRow {
  depth: number;
  nodePointer: string;
  type: string;
}
