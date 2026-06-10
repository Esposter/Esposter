import type { SlashCommandParameters } from "@/models/message/slashCommands/SlashCommandParameters";
import type { StandardCreateMessageInput } from "@esposter/db-schema";

import { SlashCommandType } from "@/models/message/slashCommands/SlashCommandType";
import { authClient } from "@/services/auth/authClient";
import { parseDuration } from "@/services/message/slashCommands/parseDuration";
import { useDataStore } from "@/store/message/data";
import { usePollDialogStore } from "@/store/message/input/pollDialog";
import { useReplyStore } from "@/store/message/input/reply";
import { useRoomStore } from "@/store/message/room";
import { createRandomBoolean } from "@/util/math/random/createRandomBoolean";
import { MessageType } from "@esposter/db-schema";
import { exhaustiveGuard } from "@esposter/shared";
import { marked } from "marked";

export const useExecuteSlashCommand = () => {
  const { $trpc } = useNuxtApp();
  const session = authClient.useSession();
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const dataStore = useDataStore();
  const { storeSendMessage } = dataStore;
  const pollDialogStore = usePollDialogStore();
  const { isOpen } = storeToRefs(pollDialogStore);
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
      case SlashCommandType.Remind: {
        const { message, time } = command.parameterValues;
        const durationMs = parseDuration(time);
        if (!durationMs) break;
        if (session.value.data) {
          await $trpc.message.scheduledMessageJob.scheduleReminder.mutate({
            roomId,
            runAt: new Date(Date.now() + durationMs),
            text: message,
          });
          break;
        }
        setTimeout(() => {
          if (Notification.permission === "granted")
            // oxlint-disable-next-line no-new
            new Notification("Reminder", { body: message });
        }, durationMs);
        break;
      }
      case SlashCommandType.Roll: {
        const roll = Math.floor(Math.random() * 100) + 1;
        createMessageInput = { message: `🎲 Rolled a **${roll}**`, roomId, type: MessageType.Message };
        break;
      }
      case SlashCommandType.Shrug: {
        const { text } = command.parameterValues;
        createMessageInput = { message: `${text}¯\\_(ツ)_/¯`, roomId, type: MessageType.Message };
        break;
      }
      case SlashCommandType.TableFlip:
        createMessageInput = { message: `(╯°□°）╯︵ ┻━┻`, roomId, type: MessageType.Message };
        break;
      case SlashCommandType.Topic: {
        await $trpc.room.updateRoom.mutate({ id: roomId, topic: command.parameterValues.text });
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
