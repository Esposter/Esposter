<script setup lang="ts">
import { useRoomStore } from "@/store/message/room";
import { mergeProps } from "vue";

const roomStore = useRoomStore();
const { currentRoomId } = storeToRefs(roomStore);
const roomName = useRoomName(currentRoomId);
const dialog = ref(false);
</script>

<template>
  <v-dialog v-model="dialog">
    <template #activator="{ props: dialogProps }">
      <v-tooltip location="bottom" text="Add Friends to Room">
        <template #activator="{ props: tooltipProps }">
          <v-btn icon="mdi-account-plus" size="small" :="mergeProps(dialogProps, tooltipProps)" />
        </template>
      </v-tooltip>
    </template>
    <StyledCard px-4>
      <v-card-title px-0>
        Invite friends to <span font-bold>{{ roomName }}</span>
      </v-card-title>
      <v-card-text px-0 py-2>
        <div mb-2>Send An Invite Link To A Friend!</div>
        <NuxtErrorBoundary v-if="currentRoomId" :key="currentRoomId">
          <Suspense>
            <MessageModelRoomInviteManager :room-id="currentRoomId" />
            <template #fallback>
              <v-skeleton-loader type="list-item-two-line" />
            </template>
          </Suspense>
          <template #error="{ clearError }">
            <v-alert type="error" text="Couldn't load your invite link.">
              <template #append>
                <v-btn variant="text" @click="clearError">Retry</v-btn>
              </template>
            </v-alert>
          </template>
        </NuxtErrorBoundary>
      </v-card-text>
    </StyledCard>
  </v-dialog>
</template>
