import type { Music } from "#src/audio/Music";
import type { ScheduledMusicNote } from "#src/audio/ScheduledMusicNote";

// Every note of a playlist that starts within [from, to), in seconds from its first pass's start: its segments walked
// In their order, pass after pass while it loops, each note at its segment's start plus its own
export const collectMusicNotes = (
  { isLooping, order, segments }: Music,
  from: number,
  to: number,
): ScheduledMusicNote[] => {
  const passDuration = order.reduce((sum, index) => sum + (segments[index]?.duration ?? 0), 0);
  if (passDuration <= 0) return [];
  const scheduledNotes: ScheduledMusicNote[] = [];
  const lastPass = isLooping ? Math.ceil(to / passDuration) : 1;
  for (let pass = Math.max(Math.floor(from / passDuration), 0); pass < lastPass; pass++) {
    let segmentStart = pass * passDuration;
    for (const index of order) {
      const segment = segments[index];
      if (!segment) continue;
      else if (segmentStart >= to) break;
      else if (segmentStart + segment.duration > from)
        for (const voice of segment.voices)
          for (const note of voice.notes) {
            const time = segmentStart + note.start;
            if (time >= from && time < to) scheduledNotes.push({ note, time, voice });
          }
      segmentStart += segment.duration;
    }
  }
  return scheduledNotes;
};
