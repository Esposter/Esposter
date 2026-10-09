import type { ProfileStory } from "#src/models/profile/ProfileStory";

// A playable character's Profile tab in one language: its stories in the order the game lists them, and the name of its
// Namecard, empty for the few characters the game gives none
export interface ProfileText {
  namecardIconName: string;
  stories: ProfileStory[];
}
