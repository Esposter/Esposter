import type { Instrument } from "#src/audio/Instrument";
import type { Music } from "#src/audio/Music";

import { collectMusicNotes } from "#src/audio/collectMusicNotes";
import { MUSIC_LOOKAHEAD_SECONDS, MUSIC_SCHEDULE_INTERVAL_MS } from "#src/audio/constants";
import { createInstrumentWave } from "#src/audio/createInstrumentWave";
import { scheduleMusicNote } from "#src/audio/scheduleMusicNote";

// A piece of music played live from the start of its playlist: every half second, the notes due within the next two
// Seconds of the audio clock are scheduled, so a timer the page delays never leaves a gap. A context still suspended
// Holds its clock, so the music starts from its beginning once the context resumes. Its notes play through a gain of its
// Own, which `stop` disconnects, silencing whatever is already scheduled
export const createMusicPlayer = (
  context: AudioContext,
  music: Music,
  destination: AudioNode = context.destination,
): { start: () => void; stop: () => void } => {
  const output = new GainNode(context);
  const waves = new Map<Instrument, PeriodicWave>();
  let origin = 0;
  let scheduledUntil = 0;
  let timer: ReturnType<typeof setInterval> | undefined;
  const schedule = (): void => {
    const until = context.currentTime - origin + MUSIC_LOOKAHEAD_SECONDS;
    for (const { note, time, voice } of collectMusicNotes(music, scheduledUntil, until)) {
      let wave = waves.get(voice.instrument);
      if (!wave) {
        wave = createInstrumentWave(context, voice.instrument.harmonics);
        waves.set(voice.instrument, wave);
      }
      scheduleMusicNote(context, output, wave, voice.instrument, note, origin + time);
    }
    scheduledUntil = until;
  };
  return {
    start: () => {
      output.connect(destination);
      origin = context.currentTime;
      scheduledUntil = 0;
      schedule();
      timer = setInterval(schedule, MUSIC_SCHEDULE_INTERVAL_MS);
    },
    stop: () => {
      clearInterval(timer);
      output.disconnect();
    },
  };
};
