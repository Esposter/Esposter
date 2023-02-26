<script setup lang="ts">
import { useRoomStore } from "@/store/chat/useRoomStore";

const roomStore = useRoomStore();
const { roomName } = storeToRefs(roomStore);
const inviteCode = ref("");
const { copy, copied } = useClipboard({ source: inviteCode });
</script>

<template>
  <v-dialog max-width="500">
    <template #activator="{ props }">
      <v-btn icon="mdi-account-plus" size="small" :="props" />
    </template>
    <v-card px="4!">
      <v-card-title px="0!">
        Invite friends to <span font="bold">{{ roomName }}</span>
      </v-card-title>
      <v-card-text px="0!">
        <div mb="2">Send a room invite link to a friend</div>
        <v-text-field v-model="inviteCode" variant="filled" readonly hide-details>
          <template #append-inner>
            <v-btn v-if="copied" w="20" case="normal!" color="primary">Copied</v-btn>
            <StyledButton v-else w="20" @click="copy(inviteCode)">Copy</StyledButton>
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
