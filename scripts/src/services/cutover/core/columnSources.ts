import { callSessionsInMessage, threadFollowsInMessage } from "@esposter/db-schema";
import { getTableName } from "drizzle-orm";

// A D1 column holding a thread's root message by the number its room's object gave it. Postgres held the root's Azure
// Row key (`oldColumn`) instead, "" for the room's own call, and the number is found by that key in the room `roomColumn` names
export interface MessageNumberColumn {
  column: string;
  oldColumn: string;
  roomColumn: string;
}

const threadRootIdColumns: MessageNumberColumn[] = [
  { column: "threadRootId", oldColumn: "threadRootRowKey", roomColumn: "roomId" },
];

export const tableNameMessageNumberColumnsMap: ReadonlyMap<string, MessageNumberColumn[]> = new Map([
  [getTableName(callSessionsInMessage), threadRootIdColumns],
  [getTableName(threadFollowsInMessage), threadRootIdColumns],
]);

// The D1 columns Postgres never held, each copied as SQL NULL: a call's RealtimeKit meeting is made by its next join
export const tableNameUnsourcedColumnsMap: ReadonlyMap<string, string[]> = new Map([
  [getTableName(callSessionsInMessage), ["meetingId"]],
]);
