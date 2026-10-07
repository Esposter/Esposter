import type { MusicVoice } from "genshin-engine";

import music from "#src/data/login/music.json";
import { LOGIN_MUSIC_RECORDING_DIRECTORY } from "#src/services/login/constants";
import { loadMusicRecordings } from "#src/services/login/music/loadMusicRecordings";
import { renderMusicSegment } from "genshin-engine";

// The rate the recordings are decoded at, Opus's own, which a buffer source resamples to whatever it renders at
const DECODE_SAMPLE_RATE = 48000;
let recordingBufferMapPromise: Promise<Map<string, AudioBuffer>> | undefined;
// One segment of the login's music rendered offline as one channel at a rate, through the same notes the screen plays,
// As base64 of its 32-bit samples, which the shooting browser hands `genshin:parity listen` to score. Its recordings are
// Decoded once, on the first render that plays them; `isLayered` false renders the synthesizer alone, as the solve that
// Layers recordings over it reads it. `voices`, when given, play in place of the segment's own, under its expression
export const renderMusic = async (
  segmentIndex: number,
  sampleRate: number,
  isLayered: boolean,
  voices?: MusicVoice[],
): Promise<string> => {
  let recordingBufferMap = new Map<string, AudioBuffer>();
  if (isLayered) {
    recordingBufferMapPromise ??= loadMusicRecordings(
      new OfflineAudioContext({ length: 1, sampleRate: DECODE_SAMPLE_RATE }),
      music,
      LOGIN_MUSIC_RECORDING_DIRECTORY,
    );
    recordingBufferMap = await recordingBufferMapPromise;
  }
  const segment = music.segments[segmentIndex];
  const renderedMusic =
    voices && segment ? { ...music, segments: music.segments.with(segmentIndex, { ...segment, voices }) } : music;
  const buffer = await renderMusicSegment(renderedMusic, segmentIndex, sampleRate, recordingBufferMap);
  return new Uint8Array(buffer.getChannelData(0).buffer).toBase64();
};
