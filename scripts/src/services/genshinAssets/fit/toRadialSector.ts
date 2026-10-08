const FULL_TURN = Math.PI * 2;

// The sector of `angleCount` sectors about an axis a point stands in, counted from +x toward +z and each rounded to the
// Nearest, so the sector a point reads is the one its radius is kept under (`fitRadialProfile`, `assignSectionParts`)
export const toRadialSector = (
  x: number,
  z: number,
  [axisX, axisZ]: readonly [number, number],
  angleCount: number,
): number => {
  const turn = Math.round((Math.atan2(z - axisZ, x - axisX) / FULL_TURN) * angleCount);
  return ((turn % angleCount) + angleCount) % angleCount;
};
