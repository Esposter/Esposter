import type { SlashCommand } from "@/models/message/slashCommands/SlashCommand";
import type { SuggestionOptions } from "@tiptap/suggestion";
import type { Except } from "type-fest";

import SlashCommandList from "@/components/Message/Model/Message/SlashCommandList.vue";
import { SlashCommandType } from "@/models/message/slashCommands/SlashCommandType";
import { getRender } from "@/services/message/getRender";
import { SlashCommandDefinitionMap } from "@/services/message/slashCommands/SlashCommandDefinitionMap";
import { useDataStore } from "@/store/message/data";
import { usePollDialogStore } from "@/store/message/pollDialog";
import { useRoomStore } from "@/store/message/room";
import { MessageType } from "@esposter/db-schema";
import { exhaustiveGuard } from "@esposter/shared";

export const SlashCommandSuggestion: Except<SuggestionOptions<SlashCommand, SlashCommand>, "editor"> = {
  char: "/",
  command: ({ editor, props: slashCommand, range }) => {
    editor.chain().focus().deleteRange(range).run();
    const roomStore = useRoomStore();
    if (!roomStore.currentRoomId) return;
    const roomId = roomStore.currentRoomId;

    switch (slashCommand.type) {
      case SlashCommandType.Poll: {
        const pollDialogStore = usePollDialogStore();
        const { isOpen } = storeToRefs(pollDialogStore);
        isOpen.value = true;
        break;
      }
      case SlashCommandType.Roll: {
        const roll = Math.floor(Math.random() * 100) + 1;
        const dataStore = useDataStore();
        const { createMessage } = dataStore;
        void createMessage({
          message: `🎲 Rolled a **${roll}**`,
          roomId,
          type: MessageType.Message,
        });
        break;
      }
      default:
        exhaustiveGuard(slashCommand.type);
    }
  },
  items: ({ query }) => {
    const lowerQuery = query.toLowerCase();
    return Object.values(SlashCommandDefinitionMap).filter(
      ({ description, title }) =>
        title.toLowerCase().includes(lowerQuery) || description.toLowerCase().includes(lowerQuery),
    );
  },
  render: getRender(SlashCommandList),
};
