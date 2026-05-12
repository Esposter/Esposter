<script setup lang="ts">
import { useRoomStore } from "@/store/message/room";
import { RoutePath } from "@esposter/shared";
import { mergeProps } from "vue";

const { $trpc } = useNuxtApp();
const roomStore = useRoomStore();
const { currentRoomId } = storeToRefs(roomStore);
const inviteToken = ref("");
if (currentRoomId.value) inviteToken.value = await $trpc.room.readInviteToken.query({ roomId: currentRoomId.value });

const roomName = useRoomName(currentRoomId);
const runtimeConfig = useRuntimeConfig();
const inviteLink = computed(() =>
  inviteToken.value ? `${runtimeConfig.public.baseUrl}${RoutePath.MessagesInvite(inviteToken.value)}` : "",
);
const dialog = ref(false);
const isCopied = ref(false);
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
        <v-text-field
          v-model="inviteLink"
          variant="outlined"
          hide-details
          readonly
          bg-background
          :color="isCopied ? 'success' : undefined"
          :placeholder="`${runtimeConfig.public.baseUrl}${RoutePath.MessagesInvite('example')}`"
        >
          <template #append-inner>
            <StyledClipboardButton
              w-20
              :source="inviteLink"
              @copied="isCopied = $event"
              @create="
                async () => {
                  if (!currentRoomId) return;
                  inviteToken = await $trpc.room.createInvite.mutate({ roomId: currentRoomId });
                }
              "
            />
          </template>
        </v-text-field>
        <div v-if="inviteLink" text-gray pt-2 text-title-small>Your invite link expires in 24 hours.</div>
      </v-card-text>
    </StyledCard>
  </v-dialog>
</template>

<style scoped>
:deep(.v-field__input) {
  min-height: auto;
  font-size: 0.875rem;
  line-height: 1.25rem;
}
</style>
