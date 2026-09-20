import type { TravelerGender } from "#src/models/TravelerGender";

// How one player twin is read off the Traveler's shared voice-over pages: which of the template's two files per
// Line is theirs, and the placeholder the template carries their name through
export interface TravelerTwin {
  gender: TravelerGender;
  namePlaceholder: string;
}
