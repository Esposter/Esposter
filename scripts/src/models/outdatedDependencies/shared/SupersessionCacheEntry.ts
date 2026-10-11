import type { SupersessionVerdict } from "#src/models/outdatedDependencies/shared/SupersessionVerdict";

// A verdict with the instant GitHub was asked, an ISO 8601 string, so a read older than the cache's maximum age is re-read
export interface SupersessionCacheEntry {
  readAt: string;
  verdict: SupersessionVerdict;
}
