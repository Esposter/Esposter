import type { BandLevels } from "#src/models/genshinParity/music/BandLevels";

// The gain in decibels that brings a band of ours nearest the game's by the score's own measure, the mean of each
// Frame's gap read whole, with the distance left at it: an equaliser's band fitted exactly rather than searched. A
// Frame's gap is level while ours lies under the floor, falls until ours meets the game's and rises past it, so the
// Mean is a line between those turns and its least lies on one: the turns are swept in order, the mean carried along by
// Its slope. With no floor in the way the gain is the median of the gaps, negated. Under the first turn every frame of
// Ours lies under the floor, so the mean that starts the sweep is the one at that turn
export const fitBandGain = ({ floor, game, ours }: BandLevels): { distance: number; gain: number } => {
  let total = 0;
  const turns: [position: number, slopeChange: number][] = [];
  for (const [frame, level] of ours.entries()) {
    const target = game[frame] ?? floor;
    total += target - floor;
    if (!Number.isFinite(level)) continue;
    turns.push([floor - level, -1], [target - level, 2]);
  }
  const sortedTurns = turns.toSorted(([first], [second]) => first - second);
  const frameCount = Math.max(ours.length, 1);
  let [position] = sortedTurns[0] ?? [0];
  let best = { distance: total / frameCount, gain: position };
  let slope = 0;
  for (const [turn, slopeChange] of sortedTurns) {
    total += slope * (turn - position);
    position = turn;
    if (total / frameCount < best.distance) best = { distance: total / frameCount, gain: turn };
    slope += slopeChange;
  }
  return best;
};
