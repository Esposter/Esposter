<script setup lang="ts" generic="TMultiple extends boolean = false">
import type { FriendPickerModelValue } from "#src/models/message/room/directMessage/FriendPickerModelValue";
import type { UiListItem } from "#src/models/ui/UiListItem";
import type { PublicUser } from "@esposter/db-schema";

import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { UiTextFieldType } from "#src/models/ui/UiTextFieldType";
import { searchItems } from "#src/services/search/searchItems";
import { useFriendStore } from "#src/store/message/user/friend";

interface Props {
  excludedUserIds?: PublicUser["id"][] | undefined;
  isMultiple?: TMultiple | undefined;
}

const modelValue = defineModel<FriendPickerModelValue<TMultiple>>();
const { excludedUserIds = [], isMultiple } = defineProps<Props>();
// The prop's type is the generic, so Vue gives it no Boolean runtime type and a bare `is-multiple` arrives as `""`. Present
// Is on, as for an HTML attribute; only an absent or bound-false prop picks one
const isMultipleMode = computed(() => isMultiple !== undefined && isMultiple !== false);
const friendStore = useFriendStore();
const { friends } = storeToRefs(friendStore);
const searchQuery = ref("");
const excludedUserIdSet = computed(() => new Set(excludedUserIds));
const friendItems = computed(() =>
  searchItems(
    friends.value.filter(({ id }) => !excludedUserIdSet.value.has(id)),
    searchQuery.value,
    ({ name }) => ({ name }),
  ).map<UiListItem<string>>(({ id, image, name }) => ({ image, title: name, value: id })),
);
// The single/multiple split is the component's generic, which the template cannot narrow — so the two shapes of
// The model are read and written here, in one place, rather than cast at every binding
// oxlint-disable typescript/no-unsafe-type-assertion -- the model is a list or an id by TMultiple, a conditional type that the compiler cannot narrow by the mode's runtime flag; the value written is the shape the mode holds, which FriendPickerModelValue<TMultiple> selects at runtime
const readModelValue = () => modelValue.value as string | string[] | undefined;
// oxlint-enable typescript/no-unsafe-type-assertion
const writeModelValue = (value: string | string[] | undefined) => {
  // oxlint-disable typescript/no-unsafe-type-assertion -- the model is a list or an id by TMultiple, a conditional type that the compiler cannot narrow by the mode's runtime flag; the value written is the shape the mode holds, which FriendPickerModelValue<TMultiple> selects at runtime
  modelValue.value = value as FriendPickerModelValue<TMultiple>;
  // oxlint-enable typescript/no-unsafe-type-assertion
};
const selectedUserIds = computed(() => {
  const value = readModelValue();
  if (Array.isArray(value)) return value;
  return value ? [value] : [];
});
const toggleFriend = (id: string) => {
  if (isMultipleMode.value)
    writeModelValue(
      selectedUserIds.value.includes(id)
        ? selectedUserIds.value.filter((userId) => userId !== id)
        : [...selectedUserIds.value, id],
    );
  else writeModelValue(readModelValue() === id ? undefined : id);
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
    <!-- The field stays at the top of the body as the list scrolls under it. Its own fill is translucent, so the band
      behind it takes the frame's surface -->
    <div pb-2 bg-lifted top-0 sticky z-1>
      <UiTextField v-model="searchQuery" is-autofocus label="Search friends" :type="UiTextFieldType.Search" />
    </div>
    <!-- The selection is written through the pick alone, so choosing a friend already chosen lets them go again in a
         picker of one as well as of several -->
    <UiList
      v-if="friendItems.length > 0"
      :is-multiple="isMultipleMode ? true : undefined"
      :items="friendItems"
      label="Friends"
      :model-value="selectedUserIds"
      @select="(id) => toggleFriend(id)"
    />
    <UiEmptyState
      v-else
      :description="searchQuery ? 'No friend of yours goes by that name.' : undefined"
      :meaning="UiIconMeaning.Person"
      title="No friends found"
    />
  </div>
</template>
