// A one-metre-wide box two metres tall at the origin, drawn from a camera at its centre height six metres back, looking
// Straight ahead. Its reference is our own render of this fixture, not a frame of the game
export const props = { cameraPose: { fov: 45, heading: 0, pitch: 0, position: [0, 0, 6] } };
export const readyEvent = "ready";
