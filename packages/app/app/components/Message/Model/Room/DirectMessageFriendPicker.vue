<script setup lang="ts">
import type { User } from "@esposter/db-schema";

import { useFriendStore } from "@/store/message/user/friend";

interface DirectMessageFriendPickerProps {
  excludedUserIds?: User["id"][];
  isMultiple?: boolean;
}

const modelValue = defineModel<User["id"][]>({ default: [] });
const { excludedUserIds = [], isMultiple = false } = defineProps<DirectMessageFriendPickerProps>();
const friendStore = useFriendStore();
const { friends } = storeToRefs(friendStore);
const search = ref("");
const excludedUserIdSet = computed(() => new Set(excludedUserIds));
const displayFriends = computed(() =>
  friends.value.filter(
    ({ id, name }) =>
      !excludedUserIdSet.value.has(id) && (!search.value || name.toLowerCase().includes(search.value.toLowerCase())),
  ),
);
const reset = () => {
  search.value = "";
};

defineExpose({ reset });

const { readFriends } = useReadFriends();
await readFriends();
</script>

<template>
  <v-container>
    <v-text-field v-model="search" placeholder="Search friends" autofocus clearable hide-details />
    <v-list overflow-y-auto lines="two" max-height="360">
      <v-list-item
        v-for="{ id, image, name } of displayFriends"
        :key="id"
        :title="name"
        @click="
          modelValue = modelValue.includes(id)
            ? modelValue.filter((userId) => userId !== id)
            : isMultiple
              ? [...modelValue, id]
              : [id]
        "
      >
        <template #prepend>
          <StyledAvatar mr-3 :image :name :avatar-props="{ size: '2.25rem' }" />
        </template>
        <template #append>
          <v-checkbox-btn :model-value="modelValue.includes(id)" />
        </template>
      </v-list-item>
      <v-list-item v-if="displayFriends.length === 0" title="No friends found" />
    </v-list>
  </v-container>
</template>
