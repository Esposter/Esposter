import type { JSONContent } from "@tiptap/core";

import { longestBacktickRun } from "@/services/resource/note/serialize/longestBacktickRun";

export const serializeCodeBlock = (node: JSONContent) => {
  const text = (node.content ?? []).map(({ text: content }) => content ?? "").join("");
  const fence = "`".repeat(Math.max(3, longestBacktickRun(text) + 1));
  return `${fence}${String(node.attrs?.language ?? "")}\n${text}\n${fence}`;
};
