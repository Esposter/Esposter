import type { ReplayId } from "@/models/ReplayId";

import { ID_SEPARATOR } from "@esposter/shared";

const REPLAY_ID_REGEX = new RegExp(String.raw`^(?<eventId>.+)\\${ID_SEPARATOR}(?<replayAttempts>\d+)$`, "u");
// Split a dead-lettered event's id into its original identity and the replay count formatReplayId appended.
// The counter lives on the id because a replay that fails again is dead-lettered into a *new* blob: nothing
// Attached to the blob — metadata, name, prefix — survives the cycle, while the id is republished verbatim and
// Event Grid writes it straight back into the next dead-letter payload. An id without the suffix is an event
// This function has never replayed, so it starts at zero.
export const parseReplayId = (id: string): ReplayId => {
  const groups = REPLAY_ID_REGEX.exec(id)?.groups;
  if (!groups?.eventId || !groups.replayAttempts) return { eventId: id, replayAttempts: 0 };
  return { eventId: groups.eventId, replayAttempts: Number(groups.replayAttempts) };
};
