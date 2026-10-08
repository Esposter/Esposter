// An entry before its name is checked against the game's text: its id in the codex, the text hash of its name and its
// order in the codex
export interface ArchiveCandidate {
  id: number;
  nameTextMapHash: number;
  sortOrder: number;
}
