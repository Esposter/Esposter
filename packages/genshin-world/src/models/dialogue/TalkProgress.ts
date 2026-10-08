// Where a running talk stands: the line on screen, "" once the talk has ended, and whether its words are all written
// Out yet
export interface TalkProgress {
  isRevealed: boolean;
  lineId: string;
}
