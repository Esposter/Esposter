import type { CallParticipant } from "#shared/models/room/call/CallParticipant";
import type { CallSessionInMessage } from "@esposter/db-schema";

import { useTableClient } from "@@/server/composables/azure/table/useTableClient";
import { callStartTimeMap } from "@@/server/services/message/call/callStartTimeMap";
import { createCallParticipant } from "@@/server/services/message/call/createCallParticipant";
import { getCallParticipants } from "@@/server/services/message/call/getCallParticipants";
import { callEventEmitter } from "@@/server/services/message/events/callEventEmitter";
import { messageEventEmitter } from "@@/server/services/message/events/messageEventEmitter";
import { createMessage } from "@esposter/db";
import { AzureTable, MessageType } from "@esposter/db-schema";
import { getResultAsync } from "@esposter/shared";

export const joinCallAsParticipant = async (
  { id: callSessionId, roomId }: Pick<CallSessionInMessage, "id" | "roomId">,
  participant: CallParticipant,
  sessionId: string,
  userId: string,
) => {
  const isFirstJoiner = getCallParticipants(callSessionId).length === 0;
  createCallParticipant(callSessionId, participant);
  callEventEmitter.emit("joinCall", { callSessionId, participant, sessionId });

  if (isFirstJoiner) {
    callStartTimeMap.set(callSessionId, new Date());
    if (roomId)
      await getResultAsync(async () => {
        const [messageClient, messageAscendingClient] = await Promise.all([
          useTableClient(AzureTable.Messages),
          useTableClient(AzureTable.MessagesAscending),
        ]);
        const systemMessage = await createMessage(messageClient, messageAscendingClient, {
          roomId,
          type: MessageType.Call,
          userId,
        });
        messageEventEmitter.emit("createMessage", [[systemMessage], { isSendToSelf: true, sessionId }]);
      })
        .orTee(console.error)
        .unwrapOr(undefined);
  }

  return { callSessionId, participants: getCallParticipants(callSessionId) };
};
