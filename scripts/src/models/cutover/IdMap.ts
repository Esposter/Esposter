import type { AzureIdMapEntry, InviteCodeEntry, OldIdMapEntry } from "#src/models/cutover/IdMapEntry";
import type { IdMapScope } from "#src/models/cutover/IdMapScope";
import type { LegacyAzureTable } from "#src/models/cutover/LegacyAzureTable";

// The new ids the cutover gave every row, kept as segments in the archive bucket, so a re-run, the delta and the room imports all give
// a row the id it already has. Nothing is stored until `flush`, which writes a scope's entries given since its last flush
export interface IdMap {
  // A Postgres row's new id, given the first time the row is seen from its own createdAt. A row holding a bearer token passes the old
  // token, which is given the hash of a fresh one. Returns the entry the row is written with
  assignOldId: (oldId: string, createdAt: Date, oldToken?: string) => OldIdMapEntry;
  // An Azure entity's new id, given the first time the entity is seen, with the same hash for a bearer token
  assign: (
    azureTable: LegacyAzureTable,
    partitionKey: string,
    rowKey: string,
    createdAt: Date,
    oldToken?: string,
  ) => AzureIdMapEntry;
  // An invite's code, given the first time the invite is seen: a fresh code in place of the one it had
  assignInviteCode: (oldCode: string) => InviteCodeEntry;
  // The new code of an invite, found by the code it had
  inviteCodeOf: (oldCode: string) => string | undefined;
  // Every message of one room numbered: a message keeps its number, and a new one is numbered after the room's highest, in createdAt order
  numberMessages: (roomId: string, messages: { createdAt: Date; rowKey: string }[]) => void;
  // The number a message was given in its room, or undefined when it has none yet
  getMessageNumber: (roomId: string, rowKey: string) => number | undefined;
  // The new id of a Postgres row, found by its old UUID
  newIdOf: (oldId: string) => string | undefined;
  // Every old UUID in the text replaced by the new id its row was given
  rewrite: (text: string) => string;
  // The hash of the token a bearer token was re-issued as, found by the old token. Undefined for a token never issued
  reissuedTokenHashOf: (oldToken: string) => string | undefined;
  // Every old UUID a Postgres row was given a new id for, so verify can check that none survives in D1 or in an object key
  oldIds: () => string[];
  flush: (scope: IdMapScope) => Promise<void>;
}
