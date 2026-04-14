import type { SlashCommandParameters } from "@/models/message/slashCommands/SlashCommandParameters";

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
  return async <T extends SlashCommandType>(type: T, parameterValues: SlashCommandParameters<T>) => {
    const roomId = currentRoomId.value;
    if (!roomId) return;

    switch (type) {
      case SlashCommandType.Flip: {
        const isHeads = createRandomBoolean();
        await createMessage({
          message: marked.parse(isHeads ? `🪙 **Heads**` : `🟡 **Tails**`, { async: false }),
          roomId,
          type: MessageType.Message,
        });
        break;
      }
      case SlashCommandType.Me:
        await createMessage({
          message: marked.parse(`*${sanitizeHtml(parameterValues.message as string)}*`, { async: false }),
          roomId,
          type: MessageType.Message,
        });
        break;
      case SlashCommandType.Poll:
        isOpen.value = true;
        break;
      case SlashCommandType.Roll: {
        const roll = Math.floor(Math.random() * 100) + 1;
        await createMessage({
          message: marked.parse(`🎲 Rolled a **${roll}**`, { async: false }),
          roomId,
          type: MessageType.Message,
        });
        break;
      }
      case SlashCommandType.Shrug: {
        const prefix = (parameterValues.text as string)?.trim() ?? "";
        await createMessage({
          message: marked.parse(`${prefix}¯\\_(ツ)_/¯`, { async: false }),
          roomId,
          type: MessageType.Message,
        });
        break;
      }
      case SlashCommandType.TableFlip:
        await createMessage({
          message: marked.parse(`(╯°□°）╯︵ ┻━┻`, { async: false }),
          roomId,
          type: MessageType.Message,
        });
        break;
      case SlashCommandType.Unflip:
        await createMessage({
          message: marked.parse(`┬─┬ノ( º _ ºノ)`, { async: false }),
          roomId,
          type: MessageType.Message,
        });
        break;
      default:
        exhaustiveGuard(type);
    }
  };
};
