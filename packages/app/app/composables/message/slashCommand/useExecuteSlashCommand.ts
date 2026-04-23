import type { SlashCommandParameters } from "@/models/message/slashCommands/SlashCommandParameters";
import type { StandardCreateMessageInput } from "@esposter/db-schema";

import { SlashCommandType } from "@/models/message/slashCommands/SlashCommandType";
import { sanitizeHtml } from "@/services/sanitizeHtml/sanitizeHtml";
import { useDataStore } from "@/store/message/data";
import { usePollDialogStore } from "@/store/message/input/pollDialog";
import { useRoomStore } from "@/store/message/room";
import { createRandomBoolean } from "@/util/math/random/createRandomBoolean";
import { MessageType } from "@esposter/db-schema";
import { exhaustiveGuard } from "@esposter/shared";
import { marked } from "marked";

export const useExecuteSlashCommand = () => {
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const dataStore = useDataStore();
  const { createMessage } = dataStore;
  const pollDialogStore = usePollDialogStore();
  const { isOpen } = storeToRefs(pollDialogStore);
  return async (
    command: { [P in SlashCommandType]: { parameterValues: SlashCommandParameters<P>; type: P } }[SlashCommandType],
  ) => {
    const roomId = currentRoomId.value;
    if (!roomId) return;

    let createMessageInput: StandardCreateMessageInput | undefined;

    switch (command.type) {
      case SlashCommandType.Flip: {
        const isHeads = createRandomBoolean();
        createMessageInput = { message: isHeads ? `🌝 **Heads**` : `🌚 **Tails**`, roomId, type: MessageType.Message };
        break;
      }
      case SlashCommandType.Me: {
        const { message } = command.parameterValues;
        createMessageInput = { message: `*${message}*`, roomId, type: MessageType.Message };
        break;
      }
      case SlashCommandType.Poll:
        isOpen.value = true;
        break;
      case SlashCommandType.Roll: {
        const roll = Math.floor(Math.random() * 100) + 1;
        createMessageInput = { message: `🎲 Rolled a **${roll}**`, roomId, type: MessageType.Message };
        break;
      }
      case SlashCommandType.Shrug: {
        const { text } = command.parameterValues;
        const prefix = text?.trim() ?? "";
        createMessageInput = { message: `${prefix}¯\\_(ツ)_/¯`, roomId, type: MessageType.Message };
        break;
      }
      case SlashCommandType.TableFlip:
        createMessageInput = { message: `(╯°□°）╯︵ ┻━┻`, roomId, type: MessageType.Message };
        break;
      case SlashCommandType.Unflip:
        createMessageInput = { message: `┬─┬ノ( º _ ºノ)`, roomId, type: MessageType.Message };
        break;
      default:
        exhaustiveGuard(command);
    }

    if (createMessageInput)
      await createMessage({
        ...createMessageInput,
        message: createMessageInput.message
          ? marked.parse(sanitizeHtml(createMessageInput.message), { async: false })
          : undefined,
      });
  };
};
