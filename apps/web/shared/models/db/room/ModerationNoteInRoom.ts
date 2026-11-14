import type { ModerationNoteInMessage } from "@esposter/db-schema";

// A moderation note whose author carries the name it has in the room the note is in. Plain data over the row, since the
// procedure returns the mapped page rather than table records
export type ModerationNoteInRoom = ModerationNoteInMessage & { actorDisplayName: string };
