import type { WorldProfileNamecardsOptions } from "#src/models/profile/WorldProfileNamecardsOptions";

import { getItemDefinition } from "#src/services/inventory/getItemDefinition";
import { computeProfileNamecardItemIds } from "#src/services/profile/computeProfileNamecardItemIds";
import { useWorldPartyStore } from "#src/store/party";
import { useWorldSessionStore } from "#src/store/session";
import { computed } from "vue";

// The namecards the profile holds, read from the Friendship and the achievements each time, each named in the reader's language
export const useWorldProfileNamecards = ({
  achievementData,
  achievementProgressMap,
  friendshipLevels,
  friendshipNamecards,
}: WorldProfileNamecardsOptions) => {
  const worldPartyStore = useWorldPartyStore();
  const { characters } = storeToRefs(worldPartyStore);
  const worldSessionStore = useWorldSessionStore();
  const profileNamecards = computed(() =>
    computeProfileNamecardItemIds({
      achievements: achievementData.value?.achievements ?? [],
      categories: achievementData.value?.categories ?? [],
      characters: characters.value,
      friendshipLevels: friendshipLevels.value ?? [],
      friendshipNamecards: friendshipNamecards.value,
      progressMap: achievementProgressMap.value,
    })
      .filter((itemId) => worldSessionStore.materialDataMap.has(itemId))
      .map((itemId) => ({
        itemId,
        name: getItemDefinition(itemId, worldSessionStore.nameText, worldSessionStore.materialDataMap).name,
      })),
  );
  return { profileNamecards };
};
