import type { PageLink } from "#shared/models/app/PageLink";

export interface RecentPage extends PageLink {
  lastVisitedAt: number;
  visitCount: number;
}
