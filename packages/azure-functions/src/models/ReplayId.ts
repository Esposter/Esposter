// A dead-lettered event's id split into the identity Event Grid originally assigned and the number of times the
// Replay function has already republished it. See parseReplayId for why the count rides on the id.
export interface ReplayId {
  eventId: string;
  replayAttempts: number;
}
