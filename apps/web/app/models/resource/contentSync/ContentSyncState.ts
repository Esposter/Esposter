import type { ContentBase } from "#src/models/resource/contentSync/ContentBase";
import type { ContentSnapshot } from "#src/models/resource/contentSync/ContentSnapshot";
import type { ContentSyncKind } from "#src/models/resource/contentSync/ContentSyncKind";

export interface AdoptingContentSync {
  base: ContentBase;
  kind: typeof ContentSyncKind.Adopting;
  remoteVersion: number;
}

export interface ConflictContentSync {
  base: ContentBase;
  kind: typeof ContentSyncKind.Conflict;
  // A save refused as stale proves the server is at least one version past the base, so the conflict starts there and
  // The row it asks for moves it to the version the server holds
  remoteVersion: number;
}

export type ContentSyncState =
  | AdoptingContentSync
  | ConflictContentSync
  | SavingContentSync
  | SettledContentSync
  | UnreadContentSync;

export interface SavingContentSync {
  base: ContentBase;
  // An edit made since the save was sent that no later save has been asked for yet
  isEdited: boolean;
  // A restore asked for while the save was in flight: the person chose to replace the content, so it is adopted once
  // The save answers, whatever the answer
  isReloading: boolean;
  kind: typeof ContentSyncKind.Saving;
  // The latest save asked for while this one was in flight. Only the latest is kept, so the latest edit wins
  next?: ContentSnapshot;
  // The newest version another writer's row named while the save was in flight, compared once the save answers
  remoteVersion?: number;
  sent: ContentSnapshot;
}

export interface SettledContentSync {
  base: ContentBase;
  kind: typeof ContentSyncKind.Dirty | typeof ContentSyncKind.Failed | typeof ContentSyncKind.Synced;
}

export interface UnreadContentSync {
  kind: typeof ContentSyncKind.Unread;
}
