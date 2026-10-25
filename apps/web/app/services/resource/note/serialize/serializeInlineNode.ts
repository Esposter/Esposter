import type { NodesSerializer } from "@/models/resource/note/serialize/NodesSerializer";
import type { JSONContent } from "@tiptap/core";

import { MARK_WRAPPERS } from "@/services/resource/note/serialize/constants";
import { escapeText } from "@/services/resource/note/serialize/escapeText";
import { formatCodeSpan } from "@/services/resource/note/serialize/formatCodeSpan";

export const serializeInlineNode = (node: JSONContent, serializeInline: NodesSerializer): string => {
  if (node.type === "hardBreak") return "\\\n";

  if (node.type !== "text") return serializeInline(node.content ?? []);

  const marks = node.marks ?? [];
  const isCode = marks.some(({ type }) => type === "code");
  const text = isCode ? formatCodeSpan(node.text ?? "") : escapeText(node.text ?? "");
  return MARK_WRAPPERS.reduce((wrapped, { type, wrap }) => {
    const mark = marks.find((candidate) => candidate.type === type);
    return mark ? wrap(wrapped, mark) : wrapped;
  }, text);
};
