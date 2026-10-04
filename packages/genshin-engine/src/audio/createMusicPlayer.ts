import type { Instrument } from "#src/audio/Instrument";
import type { Music } from "#src/audio/Music";

import { collectMusicNotes } from "#src/audio/collectMusicNotes";
import { collectMusicSegments } from "#src/audio/collectMusicSegments";
import { MUSIC_LOOKAHEAD_SECONDS, MUSIC_SCHEDULE_INTERVAL_MS } from "#src/audio/constants";
import { createInstrumentWave } from "#src/audio/createInstrumentWave";
import { createNoiseBuffer } from "#src/audio/createNoiseBuffer";
import { scheduleMusicExpression } from "#src/audio/scheduleMusicExpression";
import { scheduleMusicNote } from "#src/audio/scheduleMusicNote";

// A piece of music played live from the start of its playlist: every half second, the notes due within the next two
// Seconds of the audio clock are scheduled, so a timer the page delays never leaves a gap. A context still suspended
// Holds its clock, so the music starts from its beginning once the context resumes. Each time a segment plays, its notes
// Play through a gain of their own carrying its expression, so a note ringing on past its segment's end keeps the level
// It ended at, and every segment's gain feeds one output, which `stop` disconnects, silencing whatever is scheduled
export const createMusicPlayer = (
  context: AudioContext,
  music: Music,
  destination: AudioNode = context.destination,
): { start: () => void; stop: () => void } => {
  const output = new GainNode(context);
  const sounds = new Map<Instrument, { noiseBuffer?: AudioBuffer; wave: PeriodicWave }>();
  let origin = 0;
  let scheduledUntil = 0;
  // The gain of each segment still being scheduled, by its start in the playlist
  let segmentOutputs = new Map<number, GainNode>();
  let timer: ReturnType<typeof setInterval> | undefined;
  const schedule = (): void => {
    const until = context.currentTime - origin + MUSIC_LOOKAHEAD_SECONDS;
    const nextSegmentOutputs = new Map<number, GainNode>();
    for (const scheduledSegment of collectMusicSegments(music, scheduledUntil, until)) {
      let segmentOutput = segmentOutputs.get(scheduledSegment.start);
      if (!segmentOutput) {
        segmentOutput = new GainNode(context);
        scheduleMusicExpression(
          segmentOutput.gain,
          scheduledSegment.segment.expression,
          origin + scheduledSegment.start,
        );
        segmentOutput.connect(output);
      }
      nextSegmentOutputs.set(scheduledSegment.start, segmentOutput);
      for (const { note, time, voice } of collectMusicNotes(scheduledSegment, scheduledUntil, until)) {
        let sound = sounds.get(voice.instrument);
        if (!sound) {
          sound = {
            noiseBuffer: createNoiseBuffer(context, voice.instrument.noiseBands),
            wave: createInstrumentWave(context, voice.instrument.harmonics),
          };
          sounds.set(voice.instrument, sound);
        }
        scheduleMusicNote(context, segmentOutput, sound.wave, sound.noiseBuffer, voice.instrument, note, origin + time);
      }
    }
    segmentOutputs = nextSegmentOutputs;
    scheduledUntil = until;
  };
  return {
    start: () => {
      output.connect(destination);
      origin = context.currentTime;
      segmentOutputs = new Map();
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
