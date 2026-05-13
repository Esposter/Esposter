import { getCallParticipants } from "@@/server/services/message/call/getCallParticipants";

export const setParticipantCamera = (callSessionId: string, id: string, isCameraEnabled: boolean): boolean => {
  const participant = getCallParticipants(callSessionId).find((p) => p.id === id);
  if (!participant) return false;
  participant.isCameraEnabled = isCameraEnabled;
  return true;
};
