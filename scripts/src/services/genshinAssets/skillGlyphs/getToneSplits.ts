import {
  MIN_TONE_SHARE,
  PALE_PEAK_MIN_RATIO,
  PALE_TONE_MIN_SHARE,
  TONE_BIN_COUNT,
  TONE_MIN_GAP,
  WHITE_TONE_MIN_SHARE,
} from "#src/services/genshinAssets/skillGlyphs/constants";
import { getPercentile } from "#src/services/shared/getPercentile";
import { takeOne } from "@esposter/shared";

// A bin's share of white, at its middle
const getShare = (bin: number) => (bin + 0.5) / TONE_BIN_COUNT;
// Where an icon's mark is split from its disc and its tones from one another, as shares of white: halfway between the
// Disc and its first tone, and, for an icon with a pale tone under its white, halfway between the two tones' peaks. Each
// Peak is the fullest twentieth of its range in the histogram of the mark's shares
export const getToneSplits = (shares: Iterable<number>): number[] => {
  const bins = Array.from({ length: TONE_BIN_COUNT }, () => 0);
  for (const share of shares)
    if (share >= MIN_TONE_SHARE) bins[Math.min(TONE_BIN_COUNT - 1, Math.floor(share * TONE_BIN_COUNT))]++;
  const findPeak = (from: number, to: number): number => {
    let peak = from;
    for (let bin = from; bin <= to; bin++) if (takeOne(bins, bin) > takeOne(bins, peak)) peak = bin;
    return peak;
  };
  const whiteBin = findPeak(Math.round(WHITE_TONE_MIN_SHARE * TONE_BIN_COUNT), TONE_BIN_COUNT - 1);
  const paleBin = findPeak(
    Math.round(PALE_TONE_MIN_SHARE * TONE_BIN_COUNT),
    whiteBin - Math.round(TONE_MIN_GAP * TONE_BIN_COUNT),
  );
  return takeOne(bins, paleBin) > PALE_PEAK_MIN_RATIO * getPercentile(bins.slice(paleBin + 1, whiteBin), 0.5)
    ? [getShare(paleBin) / 2, (getShare(paleBin) + getShare(whiteBin)) / 2]
    : [getShare(whiteBin) / 2];
};
