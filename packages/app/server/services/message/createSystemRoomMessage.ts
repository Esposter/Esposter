import { useTableClient } from "@@/server/composables/azure/table/useTableClient";
import { messageEventEmitter } from "@@/server/services/message/events/messageEventEmitter";
import { createMessage } from "@esposter/db";
import { AzureTable, MessageType } from "@esposter/db-schema";
import { getResultAsync, noop } from "@esposter/shared";

export const createSystemRoomMessage = async (roomId: string, userId: string, message: string, sessionId: string) => {
  await getResultAsync(async () => {
    const messageClient = await useTableClient(AzureTable.Messages);
    const messageAscendingClient = await useTableClient(AzureTable.MessagesAscending);
    const systemMessage = await createMessage(messageClient, messageAscendingClient, {
      message,
      roomId,
      type: MessageType.System,
      userId,
    });
    messageEventEmitter.emit("createMessage", [[systemMessage], { isSendToSelf: true, sessionId }]);
  }).match(noop, console.error);
};
