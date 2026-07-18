import type { Resource } from "@esposter/db-schema";

// A live resource row paired with when this device last opened it — the row comes from the server
// (so a rename shows through), the timestamp from localStorage.
export interface RecentResource extends Resource {
  viewedAt?: string;
}
