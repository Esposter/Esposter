// A piece played live: `start` plays it from its beginning, `stop` silences whatever is scheduled
export interface MusicPlayer {
  start: () => void;
  stop: () => void;
}
