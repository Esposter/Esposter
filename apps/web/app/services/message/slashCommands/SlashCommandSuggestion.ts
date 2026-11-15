import type { SlashCommand } from "#src/models/message/slashCommands/SlashCommand";
import type { SlashCommandTypeWithoutParameters } from "#src/models/message/slashCommands/SlashCommandTypeWithoutParameters";
import type { SuggestionOptions } from "@tiptap/suggestion";
import type { Except } from "type-fest";

import SlashCommandList from "#src/components/Message/Model/Message/Suggestion/SlashCommandList.vue";
import { SuggestionTrigger } from "#src/models/shared/SuggestionTrigger";
import { getRender } from "#src/services/message/getRender";
import { executeSlashCommand } from "#src/services/message/slashCommands/executeSlashCommand";
import { SlashCommandDefinitions } from "#src/services/message/slashCommands/SlashCommandDefinitionMap";
import { searchItems } from "#src/services/search/searchItems";
import { useSlashCommandStore } from "#src/store/message/input/slashCommand";
import { getResultAsync, getSynchronizedFunction, noop, normalizeString } from "@esposter/shared";
import { PluginKey } from "@tiptap/pm/state";

export const SlashCommandSuggestion: Except<SuggestionOptions<SlashCommand, SlashCommand>, "editor"> = {
  char: SuggestionTrigger.Slash,
  command: getSynchronizedFunction(({ editor, props: slashCommand, range }) =>
    getResultAsync(async () => {
      const { doc } = editor.state;
      const endPosition = doc.content.size - 1;
      const remainingText = normalizeString(doc.textBetween(range.to, endPosition, " "));
      editor.chain().focus().deleteRange({ from: range.from, to: endPosition }).run();

      if (slashCommand.parameters.length > 0) {
        const slashCommandStore = useSlashCommandStore();
        const { setPendingSlashCommand } = slashCommandStore;
        setPendingSlashCommand(slashCommand, remainingText);
        return;
      }

      // The branch above returned for every command that declares parameters, which is what leaves this one
      // Parameterless — a fact about the array's length that its type has no way to carry
      await executeSlashCommand({ parameterValues: {}, type: slashCommand.type as SlashCommandTypeWithoutParameters });
    }).match(noop, console.error),
  ),
  items: ({ query }) =>
    searchItems(SlashCommandDefinitions, query, ({ description, title }) => ({ description, title }), { title: 2 }),
  pluginKey: new PluginKey("slashCommandSuggestion"),
  render: getRender(SlashCommandList),
};
