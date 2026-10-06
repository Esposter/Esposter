// A camera held still over the world, as a reference of the game's sees it: its eye in three's axes in metres round the
// Region's origin, turned by its heading about the vertical then its pitch, and its vertical field of view, each in
// Degrees, as the parity tools' poses read
export interface WorldCameraPose {
  fov: number;
  heading: number;
  pitch: number;
  position: [number, number, number];
}
