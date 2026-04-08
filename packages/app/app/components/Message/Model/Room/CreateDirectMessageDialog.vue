<script setup lang="ts">
import type { SubmitEventPromise } from "vuetify";

import { useDirectMessageStore } from "@/store/message/room/directMessage";
import { useFriendStore } from "@/store/message/user/friend";

const isOpen = defineModel<boolean>({ default: false });
const friendStore = useFriendStore();
const { friends } = storeToRefs(friendStore);
const { readFriends } = useReadFriends();
await readFriends();
const directMessageStore = useDirectMessageStore();
const { createDirectMessage } = directMessageStore;
const search = ref("");
const selectedUserIds = ref<string[]>([]);
const filteredFriends = computed(() =>
  search.value
    ? friends.value.filter(({ name }) => name.toLowerCase().includes(search.value.toLowerCase()))
    : friends.value,
);
const onSubmit = async (_event: SubmitEventPromise, onComplete: () => void) => {
  await createDirectMessage(selectedUserIds.value);
  selectedUserIds.value = [];
  search.value = "";
  onComplete();
};
</script>

<template>
  <StyledFormDialog
    v-model="isOpen"
    :card-props="{ title: 'New Message', minWidth: 400 }"
    :confirm-button-props="{ text: 'Create Message' }"
    :confirm-button-attrs="{ disabled: selectedUserIds.length === 0 }"
    @submit="onSubmit"
  >
    <v-container>
      <v-text-field v-model="search" placeholder="Search friends" autofocus clearable hide-details mb-2 />
      <v-list lines="two" max-height="360" overflow-y-auto>
        <v-list-item
          v-for="{ id, name, image } of filteredFriends"
          :key="id"
          :title="name"
          @click="
            selectedUserIds = selectedUserIds.includes(id)
              ? selectedUserIds.filter((userId) => userId !== id)
              : [...selectedUserIds, id]
          "
        >
          <template #prepend>
            <StyledAvatar mr-3 :image :name :avatar-props="{ size: '2.25rem' }" />
          </template>
          <template #append>
            <v-checkbox-btn :model-value="selectedUserIds.includes(id)" />
          </template>
        </v-list-item>
        <v-list-item v-if="filteredFriends.length === 0" title="No friends found" />
      </v-list>
    </v-container>
  </StyledFormDialog>
</template>
