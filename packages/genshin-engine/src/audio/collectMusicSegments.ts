import type { Music } from "#src/audio/Music";
import type { ScheduledMusicSegment } from "#src/audio/ScheduledMusicSegment";

// Every segment of a playlist that sounds within [from, to), in seconds from its first pass's start: its segments
// Walked in their order, pass after pass while it loops, each at the end of the one before
export const collectMusicSegments = (
  { isLooping, order, segments }: Music,
  from: number,
  to: number,
): ScheduledMusicSegment[] => {
  const passDuration = order.reduce((sum, index) => sum + (segments[index]?.duration ?? 0), 0);
  if (passDuration <= 0) return [];
  const scheduledSegments: ScheduledMusicSegment[] = [];
  const lastPass = isLooping ? Math.ceil(to / passDuration) : 1;
  for (let pass = Math.max(Math.floor(from / passDuration), 0); pass < lastPass; pass++) {
    let start = pass * passDuration;
    for (const index of order) {
      const segment = segments[index];
      if (!segment) continue;
      else if (start >= to) break;
      else if (start + segment.duration > from) scheduledSegments.push({ segment, start });
      start += segment.duration;
    }
  }
  return scheduledSegments;
};
