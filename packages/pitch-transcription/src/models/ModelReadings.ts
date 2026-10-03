// What the model reads in a recording, a row a frame and a column a pitch: how strongly each note sounds, how
// Strongly each starts, and the pitch's finer contour, three bins to a semitone
export interface ModelReadings {
  contours: number[][];
  frames: number[][];
  onsets: number[][];
}
