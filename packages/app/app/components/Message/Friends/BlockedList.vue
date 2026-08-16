<script setup lang="ts">
import { useBlockStore } from "@/store/message/user/block";

const blockStore = useBlockStore();
const { blockedUsers } = storeToRefs(blockStore);
</script>

<template>
  <MessageFriendsSection v-if="blockedUsers.length > 0" :title="`Blocked — ${blockedUsers.length}`">
    <v-list rd>
      <MessageFriendsUserListItem v-for="{ id, name, image } of blockedUsers" :key="id" :image :name>
        <template #append>
          <MessageFriendsUnblockUserButton :user-id="id" />
        </template>
      </MessageFriendsUserListItem>
    </v-list>
  </MessageFriendsSection>
</template>
