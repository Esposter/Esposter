<script setup lang="ts">
import { useRoomStore } from "@/store/useRoomStore";

const roomStore = useRoomStore();
</script>

<template>
  <v-list>
    <v-list-item v-for="member in roomStore.members" :key="member.id" @click="">
      <template #prepend>
        <v-badge class="mt-1 mr-4" color="green" location="bottom end" dot>
          <v-list-item-avatar :image="member.avatar" />
        </v-badge>
      </template>
      {{ member.username }}
    </v-list-item>
  </v-list>
</template>
