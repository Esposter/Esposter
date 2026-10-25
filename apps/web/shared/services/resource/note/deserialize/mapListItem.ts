import type { TokensMapper } from "#shared/models/resource/note/deserialize/TokensMapper";
import type { JSONContent } from "@tiptap/core";
import type { Tokens } from "marked";

import { withLeadingParagraph } from "#shared/services/resource/note/deserialize/withLeadingParagraph";

// The list decides its items' kind, so a list that is no task list holds plain items whatever each one's checkbox says
export const mapListItem = (item: Tokens.ListItem, mapBlockTokens: TokensMapper, isTaskList: boolean): JSONContent => {
  const content = withLeadingParagraph(mapBlockTokens(item.tokens));
  return isTaskList
    ? { attrs: { checked: Boolean(item.checked) }, content, type: "taskItem" }
    : { content, type: "listItem" };
};
