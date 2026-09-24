import type { RecentPage } from "@/models/app/RecentPage";

import { FRECENCY_BUCKETS, FRECENCY_OLDEST_WEIGHT } from "@/services/app/constants";

export const getFrecency = ({ lastVisitedAt, visitCount }: RecentPage, now: number) =>
  visitCount *
  (FRECENCY_BUCKETS.find(({ maxAgeMs }) => now - lastVisitedAt <= maxAgeMs)?.weight ?? FRECENCY_OLDEST_WEIGHT);
