import { ID_SEPARATOR } from "@esposter/shared";

// An event's id from the SDK message it came from: the block's index when a message carries several, or the
// Event's type when one message yields a second event beside its own
export const getEventId = (sourceId: string, suffix: number | string) => `${sourceId}${ID_SEPARATOR}${suffix}`;
