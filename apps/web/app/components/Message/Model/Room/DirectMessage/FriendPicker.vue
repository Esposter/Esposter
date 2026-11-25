<script setup lang="ts">
import type { UiListItem } from "#src/models/ui/UiListItem";
import type { PublicUser } from "@esposter/db-schema";

import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { UiTextFieldType } from "#src/models/ui/UiTextFieldType";
import { searchItems } from "#src/services/search/searchItems";
import { useFriendStore } from "#src/store/message/user/friend";

interface Props {
  excludedUserIds?: PublicUser["id"][] | undefined;
}

const selectedUserIds = defineModel<PublicUser["id"][]>({ required: true });
const { excludedUserIds = [] } = defineProps<Props>();
const friendStore = useFriendStore();
const { friends, friendsError } = storeToRefs(friendStore);
const searchQuery = ref("");
const excludedUserIdSet = computed(() => new Set(excludedUserIds));
const friendItems = computed(() =>
  searchItems(
    friends.value.filter(({ id }) => !excludedUserIdSet.value.has(id)),
    searchQuery.value,
    ({ name }) => ({ name }),
  ).map<UiListItem<string>>(({ id, image, name }) => ({ image, title: name, value: id })),
);
const toggleFriend = (id: string) => {
  selectedUserIds.value = selectedUserIds.value.includes(id)
    ? selectedUserIds.value.filter((userId) => userId !== id)
    : [...selectedUserIds.value, id];
};

const reset = () => {
  searchQuery.value = "";
};

defineExpose({ reset });

const readFriends = useReadFriends();
await readFriends();
</script>

<template>
  <div flex flex-col>
    <!-- The field stays at the top of the body as the list scrolls under it -->
    <div pb-2 bg-lifted top-0 sticky z-1>
      <UiTextField v-model="searchQuery" is-autofocus label="Search friends" :type="UiTextFieldType.Search" />
    </div>
    <!-- The selection is written through the pick alone, so choosing a friend already chosen lets them go again -->
    <UiList
      v-if="friendItems.length > 0"
      is-multiple
      :items="friendItems"
      label="Friends"
      :model-value="selectedUserIds"
      @select="(id) => toggleFriend(id)"
    />
    <UiErrorState v-else-if="friendsError" :error="friendsError" @retry="readFriends()" />
    <UiEmptyState
      v-else
      :description="searchQuery ? 'No friend of yours goes by that name.' : undefined"
      :meaning="UiIconMeaning.Person"
      title="No friends found"
    />
  </div>
</template>
