import type { BandLevels } from "#src/models/genshinParity/music/BandLevels";

// Every band's levels cut into windows of `windowSeconds` by the time of each frame, keyed by each window's index from
// The start and holding only the windows a frame lies in. `frameTimes` are the centres of the frames in seconds
export const splitBandLevelsByWindow = (
  bandLevelsList: BandLevels[],
  frameTimes: number[],
  windowSeconds: number,
): Map<number, BandLevels[]> => {
  const windowFramesMap = Map.groupBy(frameTimes.keys(), (frame) =>
    Math.floor((frameTimes[frame] ?? 0) / windowSeconds),
  );
  return new Map(
    Array.from(windowFramesMap.entries(), ([window, frames]) => [
      window,
      bandLevelsList.map(({ floor, game, ours }) => ({
        floor,
        game: frames.map((frame) => game[frame] ?? floor),
        ours: frames.map((frame) => ours[frame] ?? -Infinity),
      })),
    ]),
  );
};
