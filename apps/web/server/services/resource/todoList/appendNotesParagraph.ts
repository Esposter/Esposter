import type { TodoListItem } from "#shared/models/resource/todoList/TodoListItem";

import { escapeHtml } from "#shared/util/text/escapeHtml";

// An agent writes plain text, and a todo's notes are the editor's HTML, so the text joins them as one escaped paragraph
// With its line breaks kept
export const appendNotesParagraph = (item: Pick<TodoListItem, "notes">, text: string) => {
  item.notes += `<p>${escapeHtml(text).replaceAll("\n", "<br>")}</p>`;
};
