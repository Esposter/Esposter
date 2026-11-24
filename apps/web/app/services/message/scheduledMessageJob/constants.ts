import { createTable } from "#src/services/shared/overlay/createTable";
import { remindersInUser, scheduledMessagesInRoom } from "@esposter/db-schema";

// A reminder is held as the row its person holds and a scheduled message as the row its room holds.
// A cancel or a send leaves that row a tombstone the list reads back.
export const reminderTable = createTable(remindersInUser);
export const scheduledMessageTable = createTable(scheduledMessagesInRoom);
