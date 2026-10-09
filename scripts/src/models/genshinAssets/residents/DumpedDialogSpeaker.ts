// One line of the game's dialog table that an NPC speaks, by the talk it belongs to, which the game numbers in its own
// Hundred, and the NPC's id
export interface DumpedDialogSpeaker {
  speakerId: number;
  talkId: number;
}
