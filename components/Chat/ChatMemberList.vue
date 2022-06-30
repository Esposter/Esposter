<script setup lang="ts">
import { useRoomStore } from "@/store/useRoomStore";

const roomStore = useRoomStore();
</script>

<template>
  <v-list>
    <template v-for="member in roomStore.members" :key="member.id">
      <v-list-item @click="">
        <template #prepend>
          <v-badge color="green" dot location="bottom end">
            <v-list-item-avatar>
              <v-img :src="member.avatar" />
            </v-list-item-avatar>
          </v-badge>
        </template>
        {{ member.username }}
      </v-list-item>
    </template>
  </v-list>
</template>
