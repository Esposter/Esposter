import type { Music, MusicVoice } from "genshin-engine";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { loginMusicSchema } from "#src/models/login/LoginMusic";
import { readGameData } from "#src/services/data/readGameData";
import { LOGIN_MUSIC_RECORDING_DIRECTORY } from "#src/services/login/constants";
import { loadMusicRecordings } from "#src/services/login/music/loadMusicRecordings";
import { renderMusicSegment } from "genshin-engine";

// The rate the recordings are decoded at, Opus's own, which a buffer source resamples to whatever it renders at
const DECODE_SAMPLE_RATE = 48000;
let musicPromise: Promise<Music> | undefined;
let recordingBufferMapPromise: Promise<Map<string, AudioBuffer>> | undefined;
// One segment of the login's music rendered offline as one channel at a rate, through the same notes the screen plays,
// As base64 of its 32-bit samples, which the shooting browser hands `genshin:parity listen` to score. The music is read
// From the hosted game data and its recordings decoded once each, on the first render that needs them; `isLayered`
// False renders the synthesizer alone, as the solve that layers recordings over it reads it. `voices`, when given, play
// In place of the segment's own, under its expression
export const renderMusic = async (
  segmentIndex: number,
  sampleRate: number,
  isLayered: boolean,
  voices?: MusicVoice[],
): Promise<string> => {
  musicPromise ??= readGameData(GAME_DATA_LOCAL_BASE_URL, "login/music", loginMusicSchema);
  const music = await musicPromise;
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
