// A node as a JSON document holds it before a document schema has checked it: its props are unknown fields, read by narrowing
export interface LooseBlockNode {
  props: Record<string, unknown>;
  type: string;
}
