import type { JSONContent } from "@tiptap/core";

// Adjacent text with the same marks is one run, which is how the editor holds it, so a token boundary does not split it
export const mergeTextNodes = (nodes: JSONContent[]): JSONContent[] =>
  nodes.reduce<JSONContent[]>((merged, node) => {
    const previous = merged.at(-1);
    const isSameRun =
      node.type === "text" &&
      previous?.type === "text" &&
      JSON.stringify(previous.marks ?? []) === JSON.stringify(node.marks ?? []);
    if (!isSameRun) return merged.toSpliced(merged.length, 0, node);

    return merged.with(merged.length - 1, { ...previous, text: `${previous.text ?? ""}${node.text ?? ""}` });
  }, []);
