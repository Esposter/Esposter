// One row of the game's dialog table, of the fields a talk's line needs: the lines that may follow it, who says it (a
// Character by its id, the Traveler, or a narration), its words and its voice-over. Its own id sits under a name the
// Dump scrambles each patch, which the reader finds by its shape
export interface DumpedDialog {
  nextDialogs: number[];
  talkAudioName?: string;
  talkContentTextMapHash: number;
  talkRole?: { id?: string; type?: string };
}
