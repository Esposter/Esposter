import type { NoteSlashItem } from "@/models/resource/note/NoteSlashItem";
import type { SuggestionOptions } from "@tiptap/suggestion";
import type { Except } from "type-fest";

import NoteBlockList from "@/components/Resource/Note/BlockList.vue";
import { getRender } from "@/services/message/getRender";
import { SuggestionTrigger } from "@/services/message/SuggestionTrigger";
import { getNoteSlashItems } from "@/services/resource/note/getNoteSlashItems";
import { searchItems } from "@/services/search/searchItems";
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
