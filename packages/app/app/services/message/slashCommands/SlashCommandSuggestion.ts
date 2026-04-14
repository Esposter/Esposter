import type { SlashCommand } from "@/models/message/slashCommands/SlashCommand";
import type { SuggestionOptions } from "@tiptap/suggestion";
import type { Except } from "type-fest";

import { getSynchronizedFunction } from "#shared/util/getSynchronizedFunction";
import SlashCommandList from "@/components/Message/Model/Message/SlashCommandList.vue";
import { SlashCommandType } from "@/models/message/slashCommands/SlashCommandType";
import { getRender } from "@/services/message/getRender";
import { SlashCommandDefinitionMap } from "@/services/message/slashCommands/SlashCommandDefinitionMap";
import { useDataStore } from "@/store/message/data";
import { usePollDialogStore } from "@/store/message/input/pollDialog";
import { useSlashCommandStore } from "@/store/message/input/slashCommand";
import { useRoomStore } from "@/store/message/room";
import { createRandomBoolean } from "@/util/math/random/createRandomBoolean";
import { MessageType } from "@esposter/db-schema";
import { exhaustiveGuard } from "@esposter/shared";
import { marked } from "marked";

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

    const roomStore = useRoomStore();
    if (!roomStore.currentRoomId) return;
    const roomId = roomStore.currentRoomId;

    switch (slashCommand.type) {
      case SlashCommandType.Flip: {
        const dataStore = useDataStore();
        const { createMessage } = dataStore;
        const isHeads = createRandomBoolean();
        await createMessage({
          message: marked.parse(isHeads ? `🪙 **Heads**` : `🟡 **Tails**`, { async: false }),
          roomId,
          type: MessageType.Message,
        });
        break;
      }
      case SlashCommandType.Me:
        break;
      case SlashCommandType.Poll: {
        const pollDialogStore = usePollDialogStore();
        const { isOpen } = storeToRefs(pollDialogStore);
        isOpen.value = true;
        break;
      }
      case SlashCommandType.Roll: {
        const dataStore = useDataStore();
        const { createMessage } = dataStore;
        const roll = Math.floor(Math.random() * 100) + 1;
        await createMessage({
          message: marked.parse(`🎲 Rolled a **${roll}**`, { async: false }),
          roomId,
          type: MessageType.Message,
        });
        break;
      }
      case SlashCommandType.Shrug:
        break;
      case SlashCommandType.TableFlip: {
        const dataStore = useDataStore();
        const { createMessage } = dataStore;
        await createMessage({
          message: marked.parse(`(╯°□°）╯︵ ┻━┻`, { async: false }),
          roomId,
          type: MessageType.Message,
        });
        break;
      }
      case SlashCommandType.Unflip: {
        const dataStore = useDataStore();
        const { createMessage } = dataStore;
        await createMessage({
          message: marked.parse(`┬─┬ノ( º _ ºノ)`, { async: false }),
          roomId,
          type: MessageType.Message,
        });
        break;
      }
      default:
        exhaustiveGuard(slashCommand.type);
    }
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
