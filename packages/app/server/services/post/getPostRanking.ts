import { POST_RANKING_AGE_PER_ORDER_OF_MAGNITUDE_MS, POST_RANKING_EPOCH_MS } from "@@/server/services/post/constants";

// The sort key a post is stored with, so the feed orders on one indexed column rather than recomputing every
// Post's score per read. Votes are log-scaled and signed so a controversial post sinks the way an unpopular one
// Does, and age is added rather than decayed, which is what keeps an already-written ranking valid over time.
export const getPostRanking = (likes: number, createdAt: Date): number =>
  Math.sign(likes) * Math.log10(Math.max(Math.abs(likes), 1)) +
  Math.max(0, createdAt.getTime() - POST_RANKING_EPOCH_MS) / POST_RANKING_AGE_PER_ORDER_OF_MAGNITUDE_MS;
