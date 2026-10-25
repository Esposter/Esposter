import type { InlineMark } from "#shared/models/resource/note/deserialize/InlineMark";
import type { JSONContent } from "@tiptap/core";

export const withMark = (nodes: JSONContent[], mark: InlineMark): JSONContent[] =>
  nodes.map((node) => (node.type === "text" ? { ...node, marks: [...(node.marks ?? []), mark] } : node));
