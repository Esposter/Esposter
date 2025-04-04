<script setup lang="ts">
import { RoutePath } from "#shared/models/router/RoutePath";
import { useRoomStore } from "@/store/esbabbler/room";

const { $trpc } = useNuxtApp();
const roomStore = useRoomStore();
const { currentRoomId, currentRoomName } = storeToRefs(roomStore);
const inviteCode = ref<null | string>(null);
if (currentRoomId.value) inviteCode.value = await $trpc.room.readInviteCode.mutate({ roomId: currentRoomId.value });

const runtimeConfig = useRuntimeConfig();
const inviteLink = computed(() =>
  inviteCode.value ? `${runtimeConfig.public.baseUrl}${RoutePath.MessagesGg(inviteCode.value)}` : "",
);
const dialog = ref(false);
</script>

<template>
  <v-dialog v-model="dialog">
    <template #activator>
      <v-tooltip location="bottom" text="Add Friends to Room">
        <template #activator="{ props }">
          <v-btn icon="mdi-account-plus" size="small" :="props" @click="dialog = true" />
        </template>
      </v-tooltip>
    </template>
    <StyledCard px-4="!">
      <v-card-title px-0="!">
        Invite friends to <span font-bold>{{ currentRoomName }}</span>
      </v-card-title>
      <v-card-text px-0="!">
        <div mb-2>Send An Invite Link To A Friend!</div>
        <v-text-field
          v-model="inviteLink"
          variant="filled"
          hide-details
          readonly
          :placeholder="`${runtimeConfig.public.baseUrl}${RoutePath.MessagesGg('example')}`"
        >
          <template #append-inner>
            <StyledClipboardButton
              w-20
              :source="inviteLink"
              @create="
                async () => {
                  if (!currentRoomId) return;
                  inviteCode = await $trpc.room.createInviteCode.mutate({ roomId: currentRoomId });
                }
              "
            />
          </template>
        </v-text-field>
      </v-card-text>
    </StyledCard>
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
