import type { SearchCandidate } from "#src/models/recreation/video/SearchCandidate";

import { formatClock } from "#src/services/recreation/video/formatClock";

export const formatCandidate = (candidate: SearchCandidate): string[] => {
  const resolution = candidate.height === undefined ? undefined : `${candidate.height}p${candidate.fps ?? ""}`;
  const details = [
    candidate.title,
    candidate.uploader,
    candidate.durationSeconds === undefined ? undefined : formatClock(candidate.durationSeconds),
    resolution,
    candidate.uploadDate,
  ].filter((detail) => detail !== undefined);
  const chapters = (candidate.chapters ?? []).map(
    (chapter) => `  ${formatClock(chapter.startSeconds)} ${chapter.title}`,
  );
  return [candidate.url, details.join(" · "), ...chapters];
};
