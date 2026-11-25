import type { ContentSnapshot } from "#src/models/resource/contentSync/ContentSnapshot";

export type ContentSyncEvent =
  | { hash: string; type: typeof ContentSyncEventType.Read; version: number }
  | { hash: string; type: typeof ContentSyncEventType.RowArrived; version: number }
  | { hash: string; type: typeof ContentSyncEventType.SaveAcknowledged; version: number }
  | { isStale: boolean; type: typeof ContentSyncEventType.SaveRejected }
  | { json: string; type: typeof ContentSyncEventType.Seeded }
  | { snapshot: ContentSnapshot; type: typeof ContentSyncEventType.SaveRequested }
  | {
      type:
        | typeof ContentSyncEventType.Edited
        | typeof ContentSyncEventType.MineKept
        | typeof ContentSyncEventType.ReloadRequested
        | typeof ContentSyncEventType.SaveRefused
        | typeof ContentSyncEventType.TheirsTaken;
    };

// What can happen to one opening's content: the person's actions, and the server's answers in whatever order they land
export const ContentSyncEventType = {
  Edited: "Edited",
  MineKept: "MineKept",
  Read: "Read",
  ReloadRequested: "ReloadRequested",
  RowArrived: "RowArrived",
  SaveAcknowledged: "SaveAcknowledged",
  SaveRefused: "SaveRefused",
  SaveRejected: "SaveRejected",
  SaveRequested: "SaveRequested",
  Seeded: "Seeded",
  TheirsTaken: "TheirsTaken",
} as const;
export type ContentSyncEventType = (typeof ContentSyncEventType)[keyof typeof ContentSyncEventType];
