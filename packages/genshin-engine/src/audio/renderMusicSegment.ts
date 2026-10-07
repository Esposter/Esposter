import type { Music } from "#src/models/audio/Music";

import { createInstrumentWave } from "#src/audio/createInstrumentWave";
import { createNoiseBuffer } from "#src/audio/createNoiseBuffer";
import { scheduleMusicExpression } from "#src/audio/scheduleMusicExpression";
import { scheduleMusicNote } from "#src/audio/scheduleMusicNote";
import { scheduleMusicRecording } from "#src/audio/scheduleMusicRecording";

// One segment of a piece rendered offline as one channel, through the same notes and expression the live player
// Schedules, for a score to compare against the sound it recreates, so at that sound's level rather than through the
// Segment's volume in the game's mix. It runs to the segment's end, where the next
// Segment would start. Its voices' recordings play from `recordingBufferMap`, so an empty map renders the synthesizer
// Alone
export const renderMusicSegment = (
  music: Music,
  segmentIndex: number,
  sampleRate: number,
  recordingBufferMap: ReadonlyMap<string, AudioBuffer>,
): Promise<AudioBuffer> => {
  const segment = music.segments[segmentIndex];
  const context = new OfflineAudioContext({
    length: Math.max(Math.ceil((segment?.duration ?? 0) * sampleRate), 1),
    numberOfChannels: 1,
    sampleRate,
  });
  const output = new GainNode(context);
  scheduleMusicExpression(output.gain, segment?.expression ?? [], 0);
  output.connect(context.destination);
  for (const { instrument, notes } of segment?.voices ?? []) {
    const wave = createInstrumentWave(context, instrument.harmonics);
    const noiseBuffer = createNoiseBuffer(context, instrument.noiseBands);
    for (const note of notes) {
      scheduleMusicNote(context, output, wave, noiseBuffer, instrument, note, note.start);
      scheduleMusicRecording(context, output, recordingBufferMap, instrument, note, note.start);
    }
  }
  return context.startRendering();
};
