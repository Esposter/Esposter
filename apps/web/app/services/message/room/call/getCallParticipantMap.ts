import type { CallParticipant } from "#shared/models/room/call/CallParticipant";

// A call's participants keyed by id, each named as the room knows them. A standalone call has no room, so its room id
// Is empty and each participant keeps the name the account carries
export const getCallParticipantMap = (
  participantMap: Map<string, CallParticipant> | undefined,
  roomId: string,
  getRoomMemberName: (roomId: string, userId: string, accountName: string) => string,
) =>
  new Map<string, CallParticipant>(
    Array.from(participantMap ?? [], ([id, participant]) => [
      id,
      roomId ? { ...participant, name: getRoomMemberName(roomId, participant.userId, participant.name) } : participant,
    ]),
  );
