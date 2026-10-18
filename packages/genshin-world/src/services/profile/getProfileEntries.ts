import type { ProfileStory } from "#src/models/profile/ProfileStory";
import type { ProfileText } from "#src/models/profile/ProfileText";

// The Profile tab's entries in the order it lists them: the character's stories, then its voice-over lines
export const getProfileEntries = ({ stories, voices }: ProfileText): ProfileStory[] => [...stories, ...voices];
