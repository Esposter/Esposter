import type { ScheduledMusicNote } from "#src/models/audio/ScheduledMusicNote";
import type { ScheduledMusicSegment } from "#src/models/audio/ScheduledMusicSegment";

// Every note of a scheduled segment that starts within [from, to), in seconds from its playlist's first pass's start,
// Each at its segment's start plus its own
export const collectMusicNotes = (
  { segment, start }: ScheduledMusicSegment,
  from: number,
  to: number,
): ScheduledMusicNote[] =>
  segment.voices.flatMap((voice) =>
    voice.notes.flatMap((note) => {
      const time = start + note.start;
      return time >= from && time < to ? [{ note, time, voice }] : [];
    }),
  );
