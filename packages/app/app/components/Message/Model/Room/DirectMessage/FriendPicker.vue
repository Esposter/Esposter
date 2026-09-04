<script setup lang="ts" generic="TMultiple extends boolean = false">
import type { User } from "@esposter/db-schema";

import { useFriendStore } from "@/store/message/user/friend";

interface DirectMessageFriendPickerProps {
  excludedUserIds?: User["id"][];
  isMultiple?: TMultiple;
}

type ModelValue = TMultiple extends true ? string[] : string | undefined;

const modelValue = defineModel<ModelValue>();
const { excludedUserIds = [], isMultiple } = defineProps<DirectMessageFriendPickerProps>();
const friendStore = useFriendStore();
const { friends } = storeToRefs(friendStore);
const searchQuery = ref("");
const excludedUserIdSet = computed(() => new Set(excludedUserIds));
const displayFriends = computed(() =>
  friends.value.filter(
    ({ id, name }) =>
      !excludedUserIdSet.value.has(id) &&
      (!searchQuery.value || name.toLowerCase().includes(searchQuery.value.toLowerCase())),
  ),
);
// The single/multiple split is the component's generic, which the template cannot narrow — so the two shapes of
// The model are read and written here, in one place, rather than cast at every binding
const selectedUserIds = computed(() => (isMultiple ? (modelValue.value as string[] | undefined) : undefined) ?? []);
const checkIsSelected = (id: string) => (isMultiple ? selectedUserIds.value.includes(id) : modelValue.value === id);
const toggleFriend = (id: string) => {
  if (!isMultiple) {
    modelValue.value = (modelValue.value === id ? undefined : id) as ModelValue;
    return;
  }

  modelValue.value = (
    checkIsSelected(id) ? selectedUserIds.value.filter((userId) => userId !== id) : [...selectedUserIds.value, id]
  ) as ModelValue;
};

const reset = () => {
  searchQuery.value = "";
};

defineExpose({ reset });

const readFriends = useReadFriends();
await readFriends();
</script>

<template>
  <v-container>
    <v-text-field v-model="searchQuery" placeholder="Search friends" autofocus clearable />
    <v-list overflow-y-auto lines="two" max-height="360">
      <v-list-item v-for="{ id, image, name } of displayFriends" :key="id" :title="name" @click="toggleFriend(id)">
        <template #prepend>
          <StyledAvatar mr-3 :image :name :avatar-props="{ size: '2.25rem' }" />
        </template>
        <template #append>
          <v-checkbox-btn :model-value="checkIsSelected(id)" />
        </template>
      </v-list-item>
      <v-list-item v-if="displayFriends.length === 0" title="No friends found" />
    </v-list>
  </v-container>
</template>
