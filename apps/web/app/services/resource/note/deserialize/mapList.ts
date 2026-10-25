import type { TokensMapper } from "@/models/resource/note/deserialize/TokensMapper";
import type { JSONContent } from "@tiptap/core";
import type { Tokens } from "marked";

import { mapListItem } from "@/services/resource/note/deserialize/mapListItem";

export const mapList = (token: Tokens.List, mapBlockTokens: TokensMapper): JSONContent => {
  // A task list holds only task items, so a list mixing both reads as the list it is and its checkboxes are dropped
  const isTaskList = token.items.every((item) => item.task);
  const content = token.items.map((item) => mapListItem(item, mapBlockTokens, isTaskList));
  if (isTaskList) return { content, type: "taskList" };

  if (token.ordered)
    return { attrs: { start: typeof token.start === "number" ? token.start : 1 }, content, type: "orderedList" };

  return { content, type: "bulletList" };
};
