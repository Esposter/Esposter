// The texel a texture's coordinates fall on, tiled past 0 and 1 as Unity samples it, its rows read from the top
export const toTexel = (
  [u, v]: readonly [number, number],
  { height, width }: { height: number; width: number },
): [number, number] => [
  Math.min(Math.floor((u - Math.floor(u)) * width), width - 1),
  Math.min(Math.floor((1 - (v - Math.floor(v))) * height), height - 1),
];
