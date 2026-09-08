import type { SlashCommandParameters } from "@/models/message/slashCommands/SlashCommandParameters";

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
  const { sendMessage } = dataStore;
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

    // Every command that posts differs only in the markdown it posts; the rest open a dialog or write a room
    // Field instead, and leave this empty so nothing is sent
    let message = "";

    switch (command.type) {
      case SlashCommandType.Flip:
        message = createRandomBoolean() ? `🌝 **Heads**` : `🌚 **Tails**`;
        break;
      case SlashCommandType.Me:
        message = `*${command.parameterValues.message}*`;
        break;
      case SlashCommandType.Poll:
        isOpen.value = true;
        break;
      case SlashCommandType.Remind:
        open(ScheduledMessageJobType.Reminder);
        break;
      case SlashCommandType.Roll:
        message = `🎲 Rolled a **${Math.floor(Math.random() * 100) + 1}**`;
        break;
      case SlashCommandType.Schedule:
        open(ScheduledMessageJobType.ScheduledMessage);
        break;
      case SlashCommandType.Shrug:
        message = `${command.parameterValues.text}¯\\_(ツ)_/¯`;
        break;
      case SlashCommandType.TableFlip:
        message = `(╯°□°）╯︵ ┻━┻`;
        break;
      case SlashCommandType.Topic: {
        const { text } = command.parameterValues;
        await executeMutation(() => $trpc.room.updateRoom.mutate({ id: roomId, topic: text }), {
          // Read as the write is sent, so a rejected topic restores what the write ahead of it stored rather than
          // What was on screen when the command was typed
          applyOptimistic: () => {
            const previousTopic = currentRoom.value?.topic;
            storeUpdateRoom({ id: roomId, topic: text });
            return () => {
              if (previousTopic !== undefined) storeUpdateRoom({ id: roomId, topic: previousTopic });
            };
          },
          key: roomId,
        });
        break;
      }
      case SlashCommandType.Unflip:
        message = `┬─┬ノ( º _ ºノ)`;
        break;
      default:
        exhaustiveGuard(command);
    }

    if (message)
      await sendMessage({
        message: marked.parse(message, { async: false }),
        replyRowKey: replyRowKey.value,
        roomId,
        type: MessageType.Message,
      });
  };
};
