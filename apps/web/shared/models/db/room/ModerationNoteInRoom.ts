import type { ModerationNoteEntity } from "@esposter/db-schema";
import type { ToData } from "@esposter/shared";

// A moderation note whose author carries the name it has in the room the note is in. Plain data over the entity's
// ToData form, since the procedure returns the mapped page rather than entity instances
export type ModerationNoteInRoom = ToData<ModerationNoteEntity> & { actorDisplayName: string };
