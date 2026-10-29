// An entry before its name is checked against the game's text: its id in the codex, the text hash of its name, the text hash
// Of its description where its table holds one, and its order in the codex
export interface ArchiveCandidate {
  descriptionTextMapHash?: number;
  id: number;
  nameTextMapHash: number;
  sortOrder: number;
}
