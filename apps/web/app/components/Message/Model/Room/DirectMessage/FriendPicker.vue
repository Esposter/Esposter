<script setup lang="ts" generic="TMultiple extends boolean = false">
import type { UiListItem } from "@/models/ui/UiListItem";
import type { User } from "@esposter/db-schema";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { UiTextFieldType } from "@/models/ui/UiTextFieldType";
import { searchItems } from "@/services/search/searchItems";
import { useFriendStore } from "@/store/message/user/friend";

type ModelValue = TMultiple extends true ? string[] : string | undefined;

interface Props {
  excludedUserIds?: User["id"][];
  isMultiple?: TMultiple;
}

const modelValue = defineModel<ModelValue>();
const { excludedUserIds = [], isMultiple } = defineProps<Props>();
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
const selectedUserIds = computed(() =>
  isMultiple
    ? ((modelValue.value as string[] | undefined) ?? [])
    : modelValue.value
      ? [modelValue.value as string]
      : [],
);
const toggleFriend = (id: string) => {
  if (isMultiple)
    modelValue.value = (
      selectedUserIds.value.includes(id)
        ? selectedUserIds.value.filter((userId) => userId !== id)
        : [...selectedUserIds.value, id]
    ) as ModelValue;
  else modelValue.value = (modelValue.value === id ? undefined : id) as ModelValue;
};

const reset = () => {
  searchQuery.value = "";
};

defineExpose({ reset });

const readFriends = useReadFriends();
await readFriends();
</script>

<template>
  <div flex flex-col gap-2>
    <UiTextField v-model="searchQuery" is-autofocus label="Search friends" :type="UiTextFieldType.Search" />
    <!-- The selection is written through the pick alone, so choosing a friend already chosen lets them go again in a
         picker of one as well as of several -->
    <UiList
      v-if="friendItems.length > 0"
      :is-multiple="isMultiple ? true : undefined"
      :items="friendItems"
      label="Friends"
      :model-value="selectedUserIds"
      max-h="[40dvh]"
      of-y-auto
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
