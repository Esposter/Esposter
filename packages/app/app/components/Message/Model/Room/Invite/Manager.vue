<script setup lang="ts">
import type { CreateInviteInput } from "#shared/models/db/room/CreateInviteInput";
import type { RoomInMessage } from "@esposter/db-schema";

import { dayjs } from "#shared/services/dayjs";
import { DEFAULT_INVITE_EXPIRE_AFTER_MINUTES, INVITE_MAX_USES_OPTIONS } from "#shared/services/room/invite/constants";
import { pluralize } from "#shared/util/text/pluralize";
import { InviteExpireAfterSelectItems } from "@/services/message/room/invite/InviteExpireAfterSelectItems";
import { InviteMaxUsesSelectItems } from "@/services/message/room/invite/InviteMaxUsesSelectItems";
import { useInviteStore } from "@/store/message/room/invite";
import { RoutePath } from "@esposter/shared";

interface InviteManagerProps {
  roomId: RoomInMessage["id"];
}

const { roomId } = defineProps<InviteManagerProps>();
const { $trpc } = useNuxtApp();
const runtimeConfig = useRuntimeConfig();
const inviteStore = useInviteStore();
const { createInvite, seedInvite } = inviteStore;
const { invites } = storeToRefs(inviteStore);
// Display reads the shared per-room map so a link regenerated on any surface updates every mounted Manager
const invite = computed(() => invites.value.get(roomId));
const expireAfterMinutes = ref<CreateInviteInput["expireAfterMinutes"]>(DEFAULT_INVITE_EXPIRE_AFTER_MINUTES);
const maxUses = ref<CreateInviteInput["maxUses"]>(0);
useQuery(() => $trpc.room.readMyInvite.query({ roomId }), {
  // Seed from the loaded invite so regenerating via one option doesn't silently reset the other to unlimited
  // (expireAfterMinutes can't be recovered from the absolute expiresAt, so it falls back to the default)
  onSuccess: (newInvite) => {
    seedInvite(roomId, newInvite ?? undefined);
    maxUses.value = INVITE_MAX_USES_OPTIONS.find((uses) => uses === invite.value?.maxUses) ?? 0;
  },
});
const onCreateInvite = () =>
  createInvite({ expireAfterMinutes: expireAfterMinutes.value, maxUses: maxUses.value, roomId });
// Changing options with a live link regenerates it — the old link is replaced (one invite per member per room)
const onUpdateOptions = async () => {
  if (invite.value) await onCreateInvite();
};
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
  if (invite.value.maxUses) {
    const remainingUses = invite.value.maxUses - invite.value.uses;
    parts.push(`${remainingUses} ${pluralize("use", remainingUses)} remaining.`);
  }
  return parts.join(" ");
});
const isCopied = ref(false);
</script>

<template>
  <div>
    <div mb-2 flex gap-2>
      <v-select
        v-model="expireAfterMinutes"
        label="Expire after"
        :items="InviteExpireAfterSelectItems"
        density="compact"
        hide-details
        @update:model-value="onUpdateOptions"
      />
      <v-select
        v-model="maxUses"
        label="Max uses"
        :items="InviteMaxUsesSelectItems"
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
        <StyledClipboardButton w-20 :source="inviteLink" @update:copied="isCopied = $event" @create="onCreateInvite" />
      </template>
    </v-text-field>
    <div v-if="inviteStateText" text-gray pt-2 text-title-small>{{ inviteStateText }}</div>
  </div>
</template>

<style scoped>
:deep(.v-field__input) {
  min-height: auto;
  font-size: 0.875rem;
  line-height: 1.25rem;
}
</style>
