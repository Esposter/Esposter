import type { WorldProfileNamecardsOptions } from "#src/models/profile/WorldProfileNamecardsOptions";

import { getItemDefinition } from "#src/services/inventory/getItemDefinition";
import { computeProfileNamecardItemIds } from "#src/services/profile/computeProfileNamecardItemIds";
import { computed } from "vue";

// The namecards the profile holds, read from the Friendship and the achievements each time, each named in the reader's language
export const useWorldProfileNamecards = ({
  achievementData,
  achievementProgressMap,
  characters,
  friendshipLevels,
  friendshipNamecards,
  materialDataMap,
  nameText,
}: WorldProfileNamecardsOptions) => {
  const profileNamecards = computed(() =>
    computeProfileNamecardItemIds({
      achievements: achievementData.value?.achievements ?? [],
      categories: achievementData.value?.categories ?? [],
      characters: characters.value,
      friendshipLevels: friendshipLevels.value ?? [],
      friendshipNamecards: friendshipNamecards.value,
      progressMap: achievementProgressMap.value,
    })
      .filter((itemId) => materialDataMap.has(itemId))
      .map((itemId) => ({ itemId, name: getItemDefinition(itemId, nameText, materialDataMap).name })),
  );
  return { profileNamecards };
};
