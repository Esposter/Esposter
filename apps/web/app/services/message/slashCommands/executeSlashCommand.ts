import type { SlashCommandParameters } from "#src/models/message/slashCommands/SlashCommandParameters";

import { SlashCommandType } from "#src/models/message/slashCommands/SlashCommandType";
import { SHRUG_FACE, TABLE_FLIP_FACE, UNFLIP_FACE } from "#src/services/message/slashCommands/constants";
import { useDataStore } from "#src/store/message/data";
import { usePollDialogStore } from "#src/store/message/input/pollDialog";
import { useReplyStore } from "#src/store/message/input/reply";
import { useScheduledMessageJobDialogStore } from "#src/store/message/input/scheduledMessageJobDialog";
import { useRoomStore } from "#src/store/message/room/index";
import { createRandomBoolean } from "#src/util/math/random/createRandomBoolean";
import { createRandomInteger } from "#src/util/math/random/createRandomInteger";
import { MessageType, ScheduledMessageJobType } from "@esposter/db-schema";
import { exhaustiveGuard } from "@esposter/shared";
import { marked } from "marked";

// Every command runs through the slash command store's one executor, see there why. The stores are looked up as the
// Command runs, so no caller holds a scope
export const executeSlashCommand = async (
  command: { [P in SlashCommandType]: { parameterValues: SlashCommandParameters<P>; type: P } }[SlashCommandType],
) => {
  const roomStore = useRoomStore();
  const { updateRoom } = roomStore;
  const { currentRoomId } = storeToRefs(roomStore);
  const dataStore = useDataStore();
  const { sendMessage } = dataStore;
  const pollDialogStore = usePollDialogStore();
  const { isOpen } = storeToRefs(pollDialogStore);
  const scheduledMessageJobDialogStore = useScheduledMessageJobDialogStore();
  const { open } = scheduledMessageJobDialogStore;
  const replyStore = useReplyStore();
  const { replyToId } = storeToRefs(replyStore);
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
      message = `🎲 Rolled a **${createRandomInteger(101, 1)}**`;
      break;
    case SlashCommandType.Schedule:
      open(ScheduledMessageJobType.ScheduledMessage);
      break;
    case SlashCommandType.Shrug:
      message = `${command.parameterValues.text}${SHRUG_FACE}`;
      break;
    case SlashCommandType.Spoiler:
      // Every ASCII punctuation mark is escaped, so the text reaches the reader as typed and the one parse after the
      // Switch cannot read a markdown mark or a tag inside the span as formatting
      message = `<span data-spoiler>${command.parameterValues.text.replaceAll(/[!-/:-@[-`{-~]/gu, String.raw`\$&`)}</span>`;
      break;
    case SlashCommandType.TableFlip:
      message = TABLE_FLIP_FACE;
      break;
    case SlashCommandType.Topic: {
      // An omitted text clears the topic, so it is sent as the column's empty value: a missing topic leaves it unchanged
      updateRoom({ id: roomId, topic: command.parameterValues.text ?? "" });
      break;
    }
    case SlashCommandType.Unflip:
      message = UNFLIP_FACE;
      break;
    default:
      exhaustiveGuard(command);
  }

  if (message)
    await sendMessage({
      message: marked.parse(message, { async: false }),
      replyToId: replyToId.value || null,
      roomId,
      type: MessageType.Message,
    });
};
