import type { ContentSnapshot } from "#src/models/resource/contentSync/ContentSnapshot";

export type ContentSyncEffect =
  | { snapshot: ContentSnapshot; type: typeof ContentSyncEffectType.Send; version: number }
  | {
      type:
        | typeof ContentSyncEffectType.ApplyRead
        | typeof ContentSyncEffectType.ReadContent
        | typeof ContentSyncEffectType.ReadRow
        | typeof ContentSyncEffectType.RequestSave;
    };

// What the reducer asks the driver to do. The reducer does no I/O, so every request leaves it as one of these
export const ContentSyncEffectType = {
  // Take the content a read brought: it is newer than what the opening holds and nothing was edited since
  ApplyRead: "ApplyRead",
  // Read another writer's content, the row first
  ReadContent: "ReadContent",
  // Read the row, to learn the version that moved past a save refused as stale
  ReadRow: "ReadRow",
  // Ask the editor for its content and save it, as Keep mine does
  RequestSave: "RequestSave",
  // Send this content as the version the server last confirmed
  Send: "Send",
} as const;
export type ContentSyncEffectType = (typeof ContentSyncEffectType)[keyof typeof ContentSyncEffectType];
