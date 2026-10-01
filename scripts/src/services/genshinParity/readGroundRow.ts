// The row of an image a point of level ground at a distance ahead lands on, for a camera at an eye height over the
// Ground pitched up by an angle under a vertical field of view, both in degrees, the image a height of rows tall: the
// Point's depth along the view and its height across it, through the pinhole
export const readGroundRow = (
  distance: number,
  { eyeHeight, fov, height, pitch }: { eyeHeight: number; fov: number; height: number; pitch: number },
): number => {
  const pitchRadians = (pitch * Math.PI) / 180;
  const focalLength = height / 2 / Math.tan((fov * Math.PI) / 360);
  const depth = distance * Math.cos(pitchRadians) - eyeHeight * Math.sin(pitchRadians);
  const drop = eyeHeight * Math.cos(pitchRadians) + distance * Math.sin(pitchRadians);
  return height / 2 + (focalLength * drop) / depth;
};
