import type { NoteSlashItem } from "#src/models/resource/note/NoteSlashItem";
import type { SuggestionOptions } from "@tiptap/suggestion";
import type { Except } from "type-fest";

import NoteBlockList from "#src/components/Resource/Note/BlockList.vue";
import { SuggestionTrigger } from "#src/models/shared/SuggestionTrigger";
import { getRender } from "#src/services/message/getRender";
import { getNoteSlashItems } from "#src/services/resource/note/getNoteSlashItems";
import { searchItems } from "#src/services/search/searchItems";
import { PluginKey } from "@tiptap/pm/state";

// The `/` at the start of a line or after a space: the typed `/query` is removed, then the block runs at the caret
export const NoteSlashSuggestion: Except<SuggestionOptions<NoteSlashItem, NoteSlashItem>, "editor"> = {
  char: SuggestionTrigger.Slash,
  command: ({ editor, props, range }) => {
    editor.chain().focus().deleteRange(range).run();
    props.onClick?.();
  },
  items: ({ editor, query }) =>
    searchItems(getNoteSlashItems(editor), query, ({ aliases, title }) => ({ aliases: aliases.join(" "), title }), {
      title: 2,
    }),
  pluginKey: new PluginKey("noteSlashSuggestion"),
  render: getRender(NoteBlockList),
};
