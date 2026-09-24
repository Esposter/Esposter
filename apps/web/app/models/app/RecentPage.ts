import type { PageLink } from "@/models/app/PageLink";

export interface RecentPage extends PageLink {
  lastVisitedAt: number;
  visitCount: number;
}
