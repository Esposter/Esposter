// The dark lines across a texture's profile (a column's or a row's mean brightness, wrapping round at its ends, as a
// Tiled texture does): each index darkest within `radius` of itself and darker by more than `prominence` than the mean
// Of the profile between `sideRange`'s two distances away on either side, so a joint between bricks counts and a stain
// Spread over the brick does not
export const findProfileMinima = (
  profile: readonly number[],
  {
    prominence,
    radius,
    sideRange: [nearSide, farSide],
  }: { prominence: number; radius: number; sideRange: readonly [number, number] },
): number[] => {
  const at = (index: number): number => profile[(index + profile.length) % profile.length] ?? 0;
  const minima: number[] = [];
  for (let index = 0; index < profile.length; index++) {
    let isDarkest = true;
    for (let offset = -radius; offset <= radius; offset++) if (at(index + offset) < at(index)) isDarkest = false;
    if (!isDarkest) continue;
    let sideSum = 0;
    for (let offset = nearSide; offset <= farSide; offset++) sideSum += at(index + offset) + at(index - offset);
    if (sideSum / ((farSide - nearSide + 1) * 2) - at(index) > prominence) minima.push(index);
  }
  return minima;
};
