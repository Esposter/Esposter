import type { Music } from "#src/audio/Music";

import { createInstrumentWave } from "#src/audio/createInstrumentWave";
import { createNoiseBuffer } from "#src/audio/createNoiseBuffer";
import { scheduleMusicNote } from "#src/audio/scheduleMusicNote";

// One segment of a piece rendered offline as one channel, through the same notes the live player schedules, for a
// Score to compare against the sound it recreates. It runs to the segment's end, where the next segment would start
export const renderMusicSegment = (music: Music, segmentIndex: number, sampleRate: number): Promise<AudioBuffer> => {
  const segment = music.segments[segmentIndex];
  const context = new OfflineAudioContext({
    length: Math.max(Math.ceil((segment?.duration ?? 0) * sampleRate), 1),
    numberOfChannels: 1,
    sampleRate,
  });
  const noiseBuffer = createNoiseBuffer(context);
  for (const { instrument, notes } of segment?.voices ?? []) {
    const wave = createInstrumentWave(context, instrument.harmonics);
    for (const note of notes)
      scheduleMusicNote(context, context.destination, wave, noiseBuffer, instrument, note, note.start);
  }
  return context.startRendering();
};
