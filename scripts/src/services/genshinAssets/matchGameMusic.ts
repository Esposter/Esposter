import { readGameMusicChroma } from "#src/services/genshinAssets/readGameMusicChroma";
import { computeChroma } from "#src/services/genshinParity/computeChroma";
import { CHROMA_HOP_LENGTH, CHROMA_MATCH_SECONDS, CHROMA_SAMPLE_RATE } from "#src/services/genshinParity/constants";
import { readAudioSamples } from "#src/services/genshinParity/readAudioSamples";
import { scoreChromaWindow } from "#src/services/genshinParity/scoreChromaWindow";

// How many of a window's best sounds are kept
const MATCH_COUNT = 3;
// Which of the game's music sounds a recording plays, by its pitch classes: each window of it, its length apart,
// Against every sound at that sound's best alignment, the best few kept with where in the sound the window starts, in
// Seconds, the start below zero when the sound begins inside the window. A sound that holds over consecutive windows
// With its start moving by their spacing is the one playing
export const matchGameMusic = async (
  recordingPath: string,
): Promise<{ matches: { id: number; score: number; start: number }[]; start: number }[]> => {
  const framesPerSecond = CHROMA_SAMPLE_RATE / CHROMA_HOP_LENGTH;
  const windowLength = CHROMA_MATCH_SECONDS * framesPerSecond;
  const recording = computeChroma(await readAudioSamples(recordingPath, CHROMA_SAMPLE_RATE), CHROMA_SAMPLE_RATE);
  const soundChromaMap = await readGameMusicChroma();
  const windows: { matches: { id: number; score: number; start: number }[]; start: number }[] = [];
  for (let start = 0; start + windowLength <= recording.loudness.length; start += windowLength) {
    const matches = Array.from(soundChromaMap, ([id, chroma]) => {
      const { lag, score } = scoreChromaWindow(recording, start, windowLength, chroma);
      return { id, score, start: lag / framesPerSecond };
    });
    windows.push({
      matches: matches
        .toSorted((firstMatch, secondMatch) => secondMatch.score - firstMatch.score)
        .slice(0, MATCH_COUNT),
      start: start / framesPerSecond,
    });
  }
  return windows;
};
