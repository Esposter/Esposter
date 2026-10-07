import type { Spectrogram } from "#src/models/genshinAssets/shared/Spectrogram";
import type { MusicNote } from "genshin-engine";

import { computeMedian } from "#src/services/genshinAssets/shared/computeMedian";
import { toFrequency } from "#src/services/genshinAssets/shared/toFrequency";
import {
  NOTE_SUPPORT_DELAY_SECONDS,
  NOTE_SUPPORT_SEMITONES,
  NOTE_SUPPORT_SPAN_SECONDS,
} from "#src/services/genshinParity/shared/constants";

// How far the game's sound stands over ours at a note's fundamental, in decibels: in each frame whose centre lies
// Within the note's heard span, the loudest bin within `NOTE_SUPPORT_SEMITONES` of its pitch in each spectrogram, and
// The median over those frames of the game's level less ours. Read against our render with the note silenced, it says
// Whether the game holds more at that pitch than every other note already gives it; undefined for a note no frame
// Centres on
export const computeNoteSupport = (
  game: Spectrogram,
  ours: Spectrogram,
  { duration, pitch, start }: MusicNote,
): number | undefined => {
  const { binCount, frameCount, frameLength, hopLength, sampleRate } = game;
  const binWidth = sampleRate / frameLength;
  const lowBin = Math.max(1, Math.floor(toFrequency(pitch - NOTE_SUPPORT_SEMITONES) / binWidth));
  const highBin = Math.min(
    binCount - 1,
    Math.max(lowBin + 1, Math.ceil(toFrequency(pitch + NOTE_SUPPORT_SEMITONES) / binWidth)),
  );
  const firstCentre = start + NOTE_SUPPORT_DELAY_SECONDS;
  const lastCentre = Math.max(start + Math.min(duration, NOTE_SUPPORT_SPAN_SECONDS), firstCentre);
  const gaps: number[] = [];
  for (let frame = 0; frame < Math.min(frameCount, ours.frameCount); frame++) {
    const centre = (frame * hopLength + frameLength / 2) / sampleRate;
    if (centre < firstCentre || centre > lastCentre) continue;
    let gamePeak = 0;
    let oursPeak = 0;
    for (let bin = lowBin; bin <= highBin; bin++) {
      gamePeak = Math.max(gamePeak, game.magnitudes[frame * binCount + bin] ?? 0);
      oursPeak = Math.max(oursPeak, ours.magnitudes[frame * binCount + bin] ?? 0);
    }
    gaps.push(20 * Math.log10(Math.max(gamePeak, Number.MIN_VALUE) / Math.max(oursPeak, Number.MIN_VALUE)));
  }
  return gaps.length > 0 ? computeMedian(gaps) : undefined;
};
