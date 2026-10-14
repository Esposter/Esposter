import type { GenshinSaveEnvelope } from "#server/models/genshin/GenshinSaveEnvelope";

// The blob's envelope and its ETag, the ETag the write that follows is conditioned on
export interface GenshinSaveState {
  envelope?: GenshinSaveEnvelope;
  etag?: string;
}
