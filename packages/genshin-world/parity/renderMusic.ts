import music from "#src/data/login/music.json";
import { renderMusicSegment } from "genshin-engine";

// One segment of the login's music rendered offline as one channel at a rate, through the same notes the screen plays,
// As base64 of its 32-bit samples, which the shooting browser hands `genshin:parity listen` to score
export const renderMusic = async (segmentIndex: number, sampleRate: number): Promise<string> => {
  const buffer = await renderMusicSegment(music, segmentIndex, sampleRate);
  return new Uint8Array(buffer.getChannelData(0).buffer).toBase64();
};
