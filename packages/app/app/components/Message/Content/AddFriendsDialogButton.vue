<script setup lang="ts">
import type { InviteInMessage } from "@esposter/db-schema";

import { dayjs } from "#shared/services/dayjs";
import { DEFAULT_INVITE_EXPIRE_AFTER_MINUTES, INVITE_MAX_USES_OPTIONS } from "#shared/services/room/invite/constants";
import { InviteExpireAfterMinutesMap } from "#shared/services/room/invite/InviteExpireAfterMinutesMap";
import { useRoomStore } from "@/store/message/room";
import { RoutePath } from "@esposter/shared";
import { mergeProps } from "vue";

const { $trpc } = useNuxtApp();
const runtimeConfig = useRuntimeConfig();
const roomStore = useRoomStore();
const { currentRoomId } = storeToRefs(roomStore);
const invite = ref<InviteInMessage | null>(null);
if (currentRoomId.value) invite.value = await $trpc.room.readMyInvite.query({ roomId: currentRoomId.value });

const expireAfterMinutes = ref<null | number>(DEFAULT_INVITE_EXPIRE_AFTER_MINUTES);
const maxUses = ref<(typeof INVITE_MAX_USES_OPTIONS)[number] | null>(null);
const expireAfterItems = [
  ...Object.entries(InviteExpireAfterMinutesMap).map(([title, value]) => ({ title, value })),
  { title: "Never", value: null },
];
const maxUsesItems = [
  { title: "No limit", value: null },
  ...INVITE_MAX_USES_OPTIONS.map((uses) => ({ title: `${uses} use${uses === 1 ? "" : "s"}`, value: uses })),
];
const createInvite = async () => {
  if (!currentRoomId.value) return;
  invite.value = await $trpc.room.createInvite.mutate({
    expireAfterMinutes: expireAfterMinutes.value,
    maxUses: maxUses.value,
    roomId: currentRoomId.value,
  });
};
// Changing options with a live link regenerates it — the old link is replaced (one invite per member per room)
const onUpdateOptions = async () => {
  if (invite.value) await createInvite();
};
const roomName = useRoomName(currentRoomId);
const inviteLink = computed(() =>
  invite.value ? `${runtimeConfig.public.baseUrl}${RoutePath.MessagesInvite(invite.value.id)}` : "",
);
const inviteStateText = computed(() => {
  if (!invite.value) return "";
  const parts = [
    invite.value.expiresAt
      ? `Your invite link expires ${dayjs(invite.value.expiresAt).fromNow()}.`
      : "Your invite link never expires.",
  ];
  if (invite.value.maxUses !== null) {
    const remainingUses = invite.value.maxUses - invite.value.uses;
    parts.push(`${remainingUses} use${remainingUses === 1 ? "" : "s"} remaining.`);
  }
  return parts.join(" ");
});
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
        <div mb-2 flex gap-2>
          <v-select
            v-model="expireAfterMinutes"
            label="Expire after"
            :items="expireAfterItems"
            density="compact"
            hide-details
            @update:model-value="onUpdateOptions"
          />
          <v-select
            v-model="maxUses"
            label="Max uses"
            :items="maxUsesItems"
            density="compact"
            hide-details
            @update:model-value="onUpdateOptions"
          />
        </div>
        <v-text-field
          v-model="inviteLink"
          variant="outlined"
          hide-details
          readonly
          bg-color="background"
          :color="isCopied ? 'success' : undefined"
          :placeholder="`${runtimeConfig.public.baseUrl}${RoutePath.MessagesInvite('example')}`"
        >
          <template #append-inner>
            <StyledClipboardButton w-20 :source="inviteLink" @copied="isCopied = $event" @create="createInvite" />
          </template>
        </v-text-field>
        <div v-if="inviteStateText" text-gray pt-2 text-title-small>{{ inviteStateText }}</div>
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
