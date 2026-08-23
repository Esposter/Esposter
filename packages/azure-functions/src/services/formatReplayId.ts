import type { ReplayId } from "#src/models/ReplayId";

import { ID_SEPARATOR } from "@esposter/shared";
// The id a republished event is sent with: its original identity plus the attempt this republish is. Rewriting the
// Suffix rather than appending keeps the id bounded no matter how many cycles it survives, and leaves the original
// Identity readable — a downstream handler that dedupes on id still sees one logical event.
export const formatReplayId = ({ eventId, replayAttempts }: ReplayId): string =>
  `${eventId}${ID_SEPARATOR}${replayAttempts}`;
