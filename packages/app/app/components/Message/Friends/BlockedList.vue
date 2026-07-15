<script setup lang="ts">
import { useBlockStore } from "@/store/message/user/block";

const blockStore = useBlockStore();
const { blockedUsers } = storeToRefs(blockStore);
const { unblockUser } = blockStore;
</script>

<template>
  <MessageFriendsSection v-if="blockedUsers.length > 0" :title="`Blocked — ${blockedUsers.length}`">
    <v-list rd>
      <MessageFriendsUserListItem v-for="{ id, name, image } of blockedUsers" :key="id" :image :name>
        <template #append>
          <v-btn text="Unblock" variant="tonal" size="small" @click="unblockUser(id)" />
        </template>
      </MessageFriendsUserListItem>
    </v-list>
  </MessageFriendsSection>
</template>
