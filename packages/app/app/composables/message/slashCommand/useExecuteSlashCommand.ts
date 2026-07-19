import type { SlashCommandParameters } from "@/models/message/slashCommands/SlashCommandParameters";
import type { StandardCreateMessageInput } from "@esposter/db-schema";

import { SlashCommandType } from "@/models/message/slashCommands/SlashCommandType";
import { useDataStore } from "@/store/message/data";
import { usePollDialogStore } from "@/store/message/input/pollDialog";
import { useReplyStore } from "@/store/message/input/reply";
import { useScheduledMessageJobDialogStore } from "@/store/message/input/scheduledMessageJobDialog";
import { useRoomStore } from "@/store/message/room";
import { createRandomBoolean } from "@/util/math/random/createRandomBoolean";
import { MessageType, ScheduledMessageJobType } from "@esposter/db-schema";
import { exhaustiveGuard } from "@esposter/shared";
import { marked } from "marked";

export const useExecuteSlashCommand = () => {
  const { $trpc } = useNuxtApp();
  const { executeMutation } = useMutation();
  const roomStore = useRoomStore();
  const { storeUpdateRoom } = roomStore;
  const { currentRoom, currentRoomId } = storeToRefs(roomStore);
  const dataStore = useDataStore();
  const { storeSendMessage } = dataStore;
  const pollDialogStore = usePollDialogStore();
  const { isOpen } = storeToRefs(pollDialogStore);
  const scheduledMessageJobDialogStore = useScheduledMessageJobDialogStore();
  const { open } = scheduledMessageJobDialogStore;
  const replyStore = useReplyStore();
  const { rowKey: replyRowKey } = storeToRefs(replyStore);
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
      case SlashCommandType.Remind:
        open(ScheduledMessageJobType.Reminder);
        break;
      case SlashCommandType.Roll: {
        const roll = Math.floor(Math.random() * 100) + 1;
        createMessageInput = { message: `🎲 Rolled a **${roll}**`, roomId, type: MessageType.Message };
        break;
      }
      case SlashCommandType.Schedule:
        open(ScheduledMessageJobType.ScheduledMessage);
        break;
      case SlashCommandType.Shrug: {
        const { text } = command.parameterValues;
        createMessageInput = { message: `${text}¯\\_(ツ)_/¯`, roomId, type: MessageType.Message };
        break;
      }
      case SlashCommandType.TableFlip:
        createMessageInput = { message: `(╯°□°）╯︵ ┻━┻`, roomId, type: MessageType.Message };
        break;
      case SlashCommandType.Topic: {
        const { text } = command.parameterValues;
        const oldTopic = currentRoom.value?.topic;
        await executeMutation(() => $trpc.room.updateRoom.mutate({ id: roomId, topic: text }), {
          applyOptimistic: () => {
            storeUpdateRoom({ id: roomId, topic: text });
            return () => {
              storeUpdateRoom({ id: roomId, topic: oldTopic });
            };
          },
        });
        break;
      }
      case SlashCommandType.Unflip:
        createMessageInput = { message: `┬─┬ノ( º _ ºノ)`, roomId, type: MessageType.Message };
        break;
      default:
        exhaustiveGuard(command);
    }

    if (!createMessageInput) return;

    await storeSendMessage({
      ...createMessageInput,
      message: createMessageInput.message ? marked.parse(createMessageInput.message, { async: false }) : undefined,
      replyRowKey: replyRowKey.value,
    });
  };
};
