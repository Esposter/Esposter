import type { SlashCommand } from "@/models/message/slashCommands/SlashCommand";
import type { SlashCommandTypeWithoutParameters } from "@/models/message/slashCommands/SlashCommandTypeWithoutParameters";
import type { SuggestionOptions } from "@tiptap/suggestion";
import type { Except } from "type-fest";

import { getSynchronizedFunction } from "#shared/util/function/getSynchronizedFunction";
import SlashCommandList from "@/components/Message/Model/Message/Suggestion/SlashCommandList.vue";
import { getRender } from "@/services/message/getRender";
import { SlashCommandDefinitions } from "@/services/message/slashCommands/SlashCommandDefinitionMap";
import { SuggestionTrigger } from "@/services/message/SuggestionTrigger";
import { useSlashCommandStore } from "@/store/message/input/slashCommand";
import { getResultAsync, noop, normalizeString } from "@esposter/shared";
import { PluginKey } from "@tiptap/pm/state";

export const SlashCommandSuggestion: Except<SuggestionOptions<SlashCommand, SlashCommand>, "editor"> = {
  char: SuggestionTrigger.SlashCommand,
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

      const executeSlashCommand = useExecuteSlashCommand();
      await executeSlashCommand({ parameterValues: {}, type: slashCommand.type as SlashCommandTypeWithoutParameters });
    }).match(noop, console.error),
  ),
  items: ({ query }) => {
    const normalizedQuery = query.toLowerCase();
    return SlashCommandDefinitions.filter(
      ({ description, title }) =>
        title.toLowerCase().includes(normalizedQuery) || description.toLowerCase().includes(normalizedQuery),
    );
  },
  pluginKey: new PluginKey("slashCommandSuggestion"),
  render: getRender(SlashCommandList),
};
