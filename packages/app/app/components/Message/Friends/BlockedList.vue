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
      <v-list-item v-for="{ id, name, image } of blockedUsers" :key="id" :title="name">
        <template #prepend>
          <v-avatar size="36" mr-3>
            <v-img v-if="image" :src="image" />
            <span v-else>{{ name[0] }}</span>
          </v-avatar>
        </template>
        <template #append>
          <v-btn text="Unblock" variant="tonal" size="small" @click="unblockUser(id)" />
        </template>
      </v-list-item>
    </v-list>
  </div>
</template>
