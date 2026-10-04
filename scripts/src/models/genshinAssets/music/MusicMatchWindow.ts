// One window of a recording matched against the game's music: where it starts in the recording, in seconds, and its
// Best sounds, each with its score and where in the sound the window starts
export interface MusicMatchWindow {
  matches: { id: number; score: number; start: number }[];
  start: number;
}
