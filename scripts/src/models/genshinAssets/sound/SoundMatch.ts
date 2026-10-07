// One of the game's sounds matched against a recording's window: the cosine of its bands' envelopes against the
// Window's at its best start, that start in the recording's seconds, and how long the sound lasts
export interface SoundMatch {
  id: number;
  score: number;
  seconds: number;
  startSeconds: number;
}
