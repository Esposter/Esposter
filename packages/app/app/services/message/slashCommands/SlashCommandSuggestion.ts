import type { SlashCommand } from "@/models/message/slashCommands/SlashCommand";
import type { SlashCommandTypeWithoutParameters } from "@/models/message/slashCommands/SlashCommandTypeWithoutParameters";
import type { SuggestionOptions } from "@tiptap/suggestion";
import type { Except } from "type-fest";

import { getSynchronizedFunction } from "#shared/util/getSynchronizedFunction";
import SlashCommandList from "@/components/Message/Model/Message/SlashCommandList.vue";
import { getRender } from "@/services/message/getRender";
import { SlashCommandDefinitionMap } from "@/services/message/slashCommands/SlashCommandDefinitionMap";
import { useSlashCommandStore } from "@/store/message/input/slashCommand";

export const SlashCommandSuggestion: Except<SuggestionOptions<SlashCommand, SlashCommand>, "editor"> = {
  char: "/",
  command: getSynchronizedFunction(async ({ editor, props: slashCommand, range }) => {
    const { doc } = editor.state;
    const endPosition = doc.content.size - 1;
    const remainingText = doc.textBetween(range.to, endPosition, " ").trim();
    editor.chain().focus().deleteRange({ from: range.from, to: endPosition }).run();

    if (slashCommand.parameters.length > 0) {
      const slashCommandStore = useSlashCommandStore();
      const { setPendingSlashCommand } = slashCommandStore;
      setPendingSlashCommand(slashCommand, remainingText);
      return;
    }

    const executeSlashCommand = useExecuteSlashCommand();
    await executeSlashCommand({ parameterValues: {}, type: slashCommand.type as SlashCommandTypeWithoutParameters });
  }),
  items: ({ query }) => {
    const lowerQuery = query.toLowerCase();
    return Object.values(SlashCommandDefinitionMap).filter(
      ({ description, title }) =>
        title.toLowerCase().includes(lowerQuery) || description.toLowerCase().includes(lowerQuery),
    );
  },
  render: getRender(SlashCommandList),
};
