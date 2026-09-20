import type { Character } from "#src/models/Character";

export interface BirthdayCandidate {
  character: Character;
  distance: number;
  isUpcoming: boolean;
}
