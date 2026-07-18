import type { Resource } from "@esposter/db-schema";

export interface RecentResourceView extends Pick<Resource, "id" | "name" | "type"> {
  // ISO string, not a Date: this round-trips through localStorage as JSON.
  // Entries written before recents tracked a timestamp have none, so the label is conditional.
  viewedAt?: string;
}
