import type { Instrument } from "#src/models/audio/Instrument";
import type { Music } from "#src/models/audio/Music";
import type { MusicPlayer } from "#src/models/audio/MusicPlayer";

import { collectMusicNotes } from "#src/audio/collectMusicNotes";
import { collectMusicSegments } from "#src/audio/collectMusicSegments";
import { MUSIC_LOOKAHEAD_SECONDS, MUSIC_SCHEDULE_INTERVAL_MS } from "#src/audio/constants";
import { createInstrumentWave } from "#src/audio/createInstrumentWave";
import { createNoiseBuffer } from "#src/audio/createNoiseBuffer";
import { scheduleMusicExpression } from "#src/audio/scheduleMusicExpression";
import { scheduleMusicNote } from "#src/audio/scheduleMusicNote";
import { scheduleMusicRecording } from "#src/audio/scheduleMusicRecording";

// A piece of music played live from the start of its playlist: every half second, the notes due within the next two
// Seconds of the audio clock are scheduled, so a timer the page delays never leaves a gap. A context still
// Suspended holds its clock, so the music starts from its beginning once the context resumes. Each time a segment
// Plays, its notes play through a gain of their own carrying its expression, so a note ringing on past its
// Segment's end keeps the level it ended at, and every segment's gain feeds one output, which `stop` disconnects,
// Silencing whatever is scheduled. A voice's recordings play from `recordingBufferMap`, decoded by file beforehand
export const createMusicPlayer = (
  context: AudioContext,
  music: Music,
  recordingBufferMap: ReadonlyMap<string, AudioBuffer>,
  destination: AudioNode = context.destination,
): MusicPlayer => {
  const output = new GainNode(context);
  const instrumentSoundMap = new Map<Instrument, { noiseBuffer?: AudioBuffer; wave: PeriodicWave }>();
  let origin = 0;
  let scheduledUntil = 0;
  // The gain of each segment still being scheduled, by its start in the playlist
  let startSegmentOutputMap = new Map<number, GainNode>();
  let timer: ReturnType<typeof setInterval> | undefined;
  const schedule = (): void => {
    const until = context.currentTime - origin + MUSIC_LOOKAHEAD_SECONDS;
    const nextStartSegmentOutputMap = new Map<number, GainNode>();
    for (const scheduledSegment of collectMusicSegments(music, scheduledUntil, until)) {
      let segmentOutput = startSegmentOutputMap.get(scheduledSegment.start);
      if (!segmentOutput) {
        segmentOutput = new GainNode(context);
        scheduleMusicExpression(
          segmentOutput.gain,
          scheduledSegment.segment.expression,
          origin + scheduledSegment.start,
        );
        segmentOutput.connect(output);
      }
      nextStartSegmentOutputMap.set(scheduledSegment.start, segmentOutput);
      for (const { note, time, voice } of collectMusicNotes(scheduledSegment, scheduledUntil, until)) {
        let sound = instrumentSoundMap.get(voice.instrument);
        if (!sound) {
          sound = {
            noiseBuffer: createNoiseBuffer(context, voice.instrument.noiseBands),
            wave: createInstrumentWave(context, voice.instrument.harmonics),
          };
          instrumentSoundMap.set(voice.instrument, sound);
        }
        scheduleMusicNote(context, segmentOutput, sound.wave, sound.noiseBuffer, voice.instrument, note, origin + time);
        scheduleMusicRecording(context, segmentOutput, recordingBufferMap, voice.instrument, note, origin + time);
      }
    }
    startSegmentOutputMap = nextStartSegmentOutputMap;
    scheduledUntil = until;
  };
  return {
    start: () => {
      output.connect(destination);
      origin = context.currentTime;
      startSegmentOutputMap = new Map();
      scheduledUntil = 0;
      schedule();
      timer = setInterval(() => {
        schedule();
      }, MUSIC_SCHEDULE_INTERVAL_MS);
    },
    stop: () => {
      clearInterval(timer);
      output.disconnect();
    },
  };
};
