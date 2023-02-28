<script setup lang="ts">
import { RoutePath } from "@/models/router";
import { useRoomStore } from "@/store/chat/room";

const roomStore = useRoomStore();
const { currentRoomId, roomName } = storeToRefs(roomStore);
const config = useRuntimeConfig();
const { $client } = useNuxtApp();
const dialog = ref(false);
const inviteCode = ref(
  currentRoomId.value ? await $client.room.generateInviteCode.mutate({ roomId: currentRoomId.value }) : ""
);
const inviteLink = computed(() =>
  inviteCode.value ? `${config.public.baseUrl}${RoutePath.MessagesGg(inviteCode.value)}` : ""
);
const { copy, copied } = useClipboard({ source: inviteLink });
</script>

<template>
  <v-dialog v-model="dialog" max-width="500">
    <template #activator>
      <v-tooltip location="bottom" text="Add friends to Room">
        <template #activator="{ props }">
          <v-btn icon="mdi-account-plus" size="small" :="props" @click="dialog = true" />
        </template>
      </v-tooltip>
    </template>
    <v-card px="4!">
      <v-card-title px="0!">
        Invite friends to <span font="bold">{{ roomName }}</span>
      </v-card-title>
      <v-card-text px="0!">
        <div mb="2">Send a room invite link to a friend</div>
        <v-text-field v-model="inviteLink" variant="filled" readonly hide-details>
          <template #append-inner>
            <v-btn v-if="copied" w="20" case="normal!" color="primary">Copied</v-btn>
            <StyledButton v-else w="20" @click="copy(inviteLink)">Copy</StyledButton>
          </template>
        </v-text-field>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<style scoped lang="scss">
:deep(.v-field) {
  align-items: center;
}

:deep(.v-field__append-inner) {
  padding-top: 0;
}

:deep(.v-field__outline) {
  display: none;
}
</style>
