import type { ScreenCrossing } from "#src/models/genshinParity/ScreenCrossing";

// Each screen's crossing. The world's is into Liyue's reach: the camera held just outside it, on the line from the oak
// Toward Liyue's heart, then moved past the region recheck's stretch to just inside it and turned the same way, so the
// Region's data and ground arrive and the ground's tiles are rebuilt under it, settled once every tile round the eye is
export const ScreenCrossingMap: Record<string, ScreenCrossing> = {
  WorldScreen: {
    fromProps: { cameraPose: { fov: 45, heading: 56.9, pitch: -8, position: [-644.8, 200, -420.9] } },
    settleStep: "terrain-refresh",
    toProps: { cameraPose: { fov: 45, heading: 56.9, pitch: -8, position: [-711.8, 192, -464.6] } },
  },
};
