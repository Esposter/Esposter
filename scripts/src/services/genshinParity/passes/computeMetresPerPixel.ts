// The metres one pixel spans at a depth in a frame: the frame's vertical field of view, `fovDegrees`, spread over its
// `height` pixels, at the depth's distance from the camera
export const computeMetresPerPixel = ({
  depth,
  fovDegrees,
  height,
}: {
  depth: number;
  fovDegrees: number;
  height: number;
}): number => (2 * depth * Math.tan((fovDegrees * Math.PI) / 360)) / height;
