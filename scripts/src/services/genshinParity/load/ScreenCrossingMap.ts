import type { ScreenCrossing } from "#src/models/genshinParity/ScreenCrossing";

// The camera's field of view and turn at either end of the world's crossing, which turns the same way at both
const WORLD_CROSSING_CAMERA = { fov: 45, heading: 56.9, pitch: -8 };

// Each screen's crossing. The world's is into Liyue's reach: the camera held just outside it, on the line from the oak
// Toward Liyue's heart, then moved past the region recheck's stretch to just inside it and turned the same way, so the
// Region's data and ground arrive and the ground's tiles are rebuilt under it, settled once every tile round the eye is
export const ScreenCrossingMap: Record<string, ScreenCrossing> = {
  WorldScreen: {
    fromProps: { cameraPose: { ...WORLD_CROSSING_CAMERA, position: [-644.8, 200, -420.9] } },
    settleStep: "terrain-refresh",
    toProps: { cameraPose: { ...WORLD_CROSSING_CAMERA, position: [-711.8, 192, -464.6] } },
  },
};
