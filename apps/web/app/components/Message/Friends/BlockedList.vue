<script setup lang="ts">
import { useBlockStore } from "#src/store/message/user/block";

const blockStore = useBlockStore();
const { blockedUsers, blockedUsersError } = storeToRefs(blockStore);
const readFriends = useReadFriends();
</script>

<template>
  <MessageFriendsSection v-if="blockedUsers.length > 0" :title="`Blocked — ${blockedUsers.length}`">
    <ul flex flex-col>
      <MessageFriendsUserListItem v-for="{ id, name, image } of blockedUsers" :key="id" :image :name>
        <template #append>
          <MessageFriendsUnblockUserButton :user-id="id" />
        </template>
      </MessageFriendsUserListItem>
    </ul>
    <MessageFriendsConfirmUnblockDialog />
  </MessageFriendsSection>
  <UiErrorState v-else-if="blockedUsersError" :error="blockedUsersError" @retry="readFriends()" />
</template>
