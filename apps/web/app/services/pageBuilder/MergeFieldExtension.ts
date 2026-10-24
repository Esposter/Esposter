import MergeFieldList from "@/components/PageBuilder/MergeFieldList.vue";
import { toMergeField } from "@/services/emailEditor/toMergeField";
import { getRender } from "@/services/message/getRender";
import { SuggestionTrigger } from "@/services/message/SuggestionTrigger";
import { Extension } from "@tiptap/core";
import { PluginKey } from "@tiptap/pm/state";
import { Suggestion } from "@tiptap/suggestion";

// Typing two braces offers the bound dataset's columns that match what follows them, and a chosen column takes the braces'
// Place with its merge field. The columns are read when the list is drawn, so a change to the dataset reaches the list
export const MergeFieldExtension = Extension.create<{ getColumns: () => string[] }>({
  addOptions: () => ({ getColumns: () => [] }),
  addProseMirrorPlugins() {
    const { getColumns } = this.options;
    return [
      Suggestion<string, string>({
        char: SuggestionTrigger.MergeField,
        command: ({ editor, props, range }) => {
          editor.chain().focus().insertContentAt(range, toMergeField(props)).run();
        },
        editor: this.editor,
        items: ({ query }) => getColumns().filter((column) => column.toLowerCase().includes(query.toLowerCase())),
        pluginKey: new PluginKey("mergeFieldSuggestion"),
        render: getRender(MergeFieldList),
      }),
    ];
  },
  name: "mergeField",
});
