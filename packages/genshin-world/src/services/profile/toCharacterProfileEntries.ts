import type { ProfileStory } from "#src/models/profile/ProfileStory";
import type { CharacterMenuProfileEntry } from "genshin-interface";

import { isProfileStoryUnlocked } from "#src/services/profile/isProfileStoryUnlocked";
import { fillGameTextValues } from "genshin-text";

// The stories as the Profile tab lists them: an open one by its title and text, a locked one by the game's unlock line
// Naming the level it opens at and its title, or by its title alone when no level does, with no text
export const toCharacterProfileEntries = (
  profileStories: readonly ProfileStory[],
  friendshipLevel: number,
  unlocksText: string,
): CharacterMenuProfileEntry[] =>
  profileStories.map((profileStory) =>
    isProfileStoryUnlocked(profileStory, friendshipLevel)
      ? { isLocked: false, text: profileStory.text, title: profileStory.title }
      : {
          isLocked: true,
          text: "",
          title:
            profileStory.friendshipLevel > 0
              ? fillGameTextValues(unlocksText, profileStory.friendshipLevel, profileStory.title)
              : profileStory.title,
        },
  );
