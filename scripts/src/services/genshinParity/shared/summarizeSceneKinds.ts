import type { FrameRange } from "#src/models/genshinParity/shared/FrameRange";
import type { GpuPass } from "#src/models/genshinParity/shared/GpuPass";
import type { SceneKindTrace } from "#src/models/genshinParity/shared/SceneKindTrace";

const MS_DECIMALS = 100;
const MS_PER_SECOND = 1000;
const FIRST_LETTER_CODE = 65;

const roundMs = (ms: number): number => Math.round(ms * MS_DECIMALS) / MS_DECIMALS;

const getLetter = (index: number): string => String.fromCodePoint(FIRST_LETTER_CODE + index);

const getFrameCount = (ranges: FrameRange[]): number =>
  ranges.reduce((total, { endFrame, firstFrame }) => total + endFrame - firstFrame, 0);

// Each kind of pass over the frames of some ranges, by its encoder and attachment: its GPU time and its count a frame
const readPassUseMap = (passes: GpuPass[], ranges: FrameRange[]): Map<string, { count: number; ms: number }> => {
  const frameCount = getFrameCount(ranges);
  const passUseMap = new Map<string, { count: number; ms: number }>();
  for (const { detail, frame, gpuMs, label } of passes) {
    if (!ranges.some(({ endFrame, firstFrame }) => frame >= firstFrame && frame < endFrame)) continue;
    const key = `${label} | ${detail}`;
    const use = passUseMap.get(key) ?? { count: 0, ms: 0 };
    passUseMap.set(key, { count: use.count + 1 / frameCount, ms: use.ms + gpuMs / frameCount });
  }
  return passUseMap;
};

const sumMs = (passUseMap: Map<string, { ms: number }>): number =>
  [...passUseMap.values()].reduce((total, { ms }) => total + ms, 0);

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
    `kinds, camera still: ${roundMs(sumMs(baselineUseMap))} ms a frame on the GPU with every kind drawn (${roundMs(Math.min(...baselineMs))} to ${roundMs(Math.max(...baselineMs))} across its ${baselines.length} ranges), at ${Math.round(framesPerSecond)} frames a second`,
    ...passKeys.map((key, index) => {
      const { count = 0, ms = 0 } = baselineUseMap.get(key) ?? {};
      return `  ${getLetter(index)} ${roundMs(ms)} ms a frame, ${roundMs(count)} passes a frame, ${Math.round(count * framesPerSecond)} a second: ${key}`;
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
          `${kind} | ${drawables} | ${roundMs(totalMs)} | ${savedMs.map((ms) => roundMs(ms)).join(" | ")}`,
      ),
  ];
};
