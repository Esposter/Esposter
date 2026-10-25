import type { GpuPass } from "#src/models/genshinParity/shared/GpuPass";
import type { SceneKindTrace } from "#src/models/genshinParity/shared/SceneKindTrace";

import { getFrameCount } from "#src/services/genshinParity/shared/getFrameCount";
import { getLetter } from "#src/services/genshinParity/shared/getLetter";
import { readPassUseMap } from "#src/services/genshinParity/shared/readPassUseMap";
import { roundHundredths } from "#src/services/genshinParity/shared/roundHundredths";
import { sumMs } from "#src/services/genshinParity/shared/sumMs";

const MS_PER_SECOND = 1000;

// Each kind of the scene's objects priced on each pass by the GPU's time a frame its hiding saved there, against the
// Ranges with every kind drawn either side of it, so the GPU's drift over the run cancels: first the passes, lettered,
// With their time and count a frame over every range with all drawn and their count a second, then a row a kind, the
// Kinds that save the most first. The ranges with all drawn are read apart as well, their least and most, so a saving
// Smaller than their spread reads as none
export const summarizeSceneKinds = (
  passes: GpuPass[],
  times: number[],
  { baselines, kinds }: SceneKindTrace,
): string[] => {
  const baselineUseMap = readPassUseMap(passes, baselines);
  const passKeys = [...baselineUseMap]
    .toSorted(([, firstUse], [, secondUse]) => secondUse.ms - firstUse.ms)
    .map(([key]) => key);
  // A range lasts from its first frame to the frame after its last, which the frames left to settle after it provide
  const durationMs = baselines.reduce(
    (total, { endFrame, firstFrame }) => total + (times[endFrame] ?? 0) - (times[firstFrame] ?? 0),
    0,
  );
  const framesPerSecond = durationMs > 0 ? (getFrameCount(baselines) * MS_PER_SECOND) / durationMs : 0;
  const baselineMs = baselines.map((baseline) => sumMs(readPassUseMap(passes, [baseline])));

  return [
    `kinds, camera still: ${roundHundredths(sumMs(baselineUseMap))} ms a frame on the GPU with every kind drawn (${roundHundredths(Math.min(...baselineMs))} to ${roundHundredths(Math.max(...baselineMs))} across its ${baselines.length} ranges), at ${Math.round(framesPerSecond)} frames a second`,
    ...passKeys.map((key, index) => {
      const { count = 0, ms = 0 } = baselineUseMap.get(key) ?? {};
      return `  ${getLetter(index)} ${roundHundredths(ms)} ms a frame, ${roundHundredths(count)} passes a frame, ${Math.round(count * framesPerSecond)} a second: ${key}`;
    }),
    `kind | drawables | ms a frame saved | ${passKeys.map((_key, index) => getLetter(index)).join(" | ")}`,
    ...kinds
      .map(({ drawables, kind, ...range }, index) => {
        const besideUseMap = readPassUseMap(passes, baselines.slice(index, index + 2));
        const hiddenUseMap = readPassUseMap(passes, [range]);
        const savedMs = passKeys.map((key) => (besideUseMap.get(key)?.ms ?? 0) - (hiddenUseMap.get(key)?.ms ?? 0));
        return { drawables, kind, savedMs, totalMs: savedMs.reduce((total, ms) => total + ms, 0) };
      })
      .toSorted((firstKind, secondKind) => secondKind.totalMs - firstKind.totalMs)
      .map(
        ({ drawables, kind, savedMs, totalMs }) =>
          `${kind} | ${drawables} | ${roundHundredths(totalMs)} | ${savedMs.map((ms) => roundHundredths(ms)).join(" | ")}`,
      ),
  ];
};
