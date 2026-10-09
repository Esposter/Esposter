import type { ProfileStory } from "#src/models/profile/ProfileStory";

// A playable character's Profile tab in one language: its stories and then its voice-overs, each in the order the game lists
// Them, and the name of its Namecard, empty for the few characters the game gives none
export interface ProfileText {
  namecardIconName: string;
  stories: ProfileStory[];
  voices: ProfileStory[];
}
