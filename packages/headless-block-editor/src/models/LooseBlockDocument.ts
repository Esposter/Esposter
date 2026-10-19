import type { LooseBlockNode } from "#src/models/LooseBlockNode";

// A document as a JSON document holds it before a document schema has checked it, the shape the pointer and patch code takes
export interface LooseBlockDocument {
  content: LooseBlockNode[];
  root: { props: object };
}
