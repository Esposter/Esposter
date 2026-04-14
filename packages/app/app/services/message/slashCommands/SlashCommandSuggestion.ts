import type { SlashCommand } from "@/models/message/slashCommands/SlashCommand";
import type { SuggestionOptions } from "@tiptap/suggestion";
import type { Except } from "type-fest";

import { getSynchronizedFunction } from "#shared/util/getSynchronizedFunction";
import SlashCommandList from "@/components/Message/Model/Message/SlashCommandList.vue";
import { SlashCommandType } from "@/models/message/slashCommands/SlashCommandType";
import { getRender } from "@/services/message/getRender";
import { SlashCommandDefinitionMap } from "@/services/message/slashCommands/SlashCommandDefinitionMap";
import { useSlashCommandStore } from "@/store/message/input/slashCommand";

export const SlashCommandSuggestion: Except<SuggestionOptions<SlashCommand, SlashCommand>, "editor"> = {
  char: "/",
  command: getSynchronizedFunction(async ({ editor, props: slashCommand, range }) => {
    editor.chain().focus().deleteRange(range).run();

    if (slashCommand.parameters.length > 0) {
      const slashCommandStore = useSlashCommandStore();
      const { setPendingSlashCommand } = slashCommandStore;
      setPendingSlashCommand(slashCommand);
      return;
    }

    const executeSlashCommand = useExecuteSlashCommand();
    await executeSlashCommand(slashCommand.type, {});
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
