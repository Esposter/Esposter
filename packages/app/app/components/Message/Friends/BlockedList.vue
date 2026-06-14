<script setup lang="ts">
import { useBlockStore } from "@/store/message/user/block";

const blockStore = useBlockStore();
const { blockedUsers } = storeToRefs(blockStore);
const { unblockUser } = blockStore;
</script>

<template>
  <div v-if="blockedUsers.length > 0">
    <div mb-3 text-title-large>Blocked — {{ blockedUsers.length }}</div>
    <v-list rd>
      <MessageFriendsUserListItem v-for="{ id, name, image } of blockedUsers" :key="id" :image :name>
        <template #append>
          <v-btn text="Unblock" variant="tonal" size="small" @click="unblockUser(id)" />
        </template>
      </MessageFriendsUserListItem>
    </v-list>
  </div>
</template>
