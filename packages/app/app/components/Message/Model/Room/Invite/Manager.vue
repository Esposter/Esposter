<script setup lang="ts">
import type { CreateInviteInput } from "#shared/models/db/room/CreateInviteInput";
import type { RoomInMessage } from "@esposter/db-schema";

import { DEFAULT_INVITE_EXPIRE_AFTER_MINUTES, INVITE_MAX_USES_OPTIONS } from "#shared/services/room/invite/constants";
import { getSynchronizedFunction } from "#shared/util/function/getSynchronizedFunction";
import { pluralize } from "#shared/util/text/pluralize";
import { InviteExpireAfterSelectItems } from "@/services/message/room/invite/InviteExpireAfterSelectItems";
import { InviteMaxUsesSelectItems } from "@/services/message/room/invite/InviteMaxUsesSelectItems";
import { useInviteStore } from "@/store/message/room/invite";
import { RoutePath } from "@esposter/shared";

interface Props {
  room: RoomInMessage;
}

const { room } = defineProps<Props>();
const runtimeConfig = useRuntimeConfig();
const inviteStore = useInviteStore();
const { createInvite } = inviteStore;
const { invites } = storeToRefs(inviteStore);
// Display reads the shared per-room map so a link regenerated in one mount updates every other one open on the
// Same room
const invite = computed(() => invites.value.get(room.id));
const expireAfterMinutes = ref<CreateInviteInput["expireAfterMinutes"]>(DEFAULT_INVITE_EXPIRE_AFTER_MINUTES);
const maxUses = ref<CreateInviteInput["maxUses"]>(0);
const onCreateInvite = () =>
  createInvite({ expireAfterMinutes: expireAfterMinutes.value, maxUses: maxUses.value, roomId: room.id });
useReadMyInvite(room.id, (newInvite) => {
  // Seed from the loaded invite so regenerating via one option doesn't silently reset the other to unlimited
  // (expireAfterMinutes can't be recovered from the absolute expiresAt, so it falls back to the default)
  maxUses.value = INVITE_MAX_USES_OPTIONS.find((uses) => uses === newInvite?.maxUses) ?? 0;
  // Discord hands the reader a link the moment the dialog opens rather than an empty field with a button on it.
  // A member holds at most one, so a read that finds none mints it here — and one that finds a live link never
  // Replaces it, which is what asking for the create would have risked
  if (!newInvite && !room.isInvitePaused) getSynchronizedFunction(onCreateInvite)();
});
// Changing options with a live link regenerates it — the old link is replaced (one invite per member per room)
const onUpdateOptions = async () => {
  if (invite.value) await onCreateInvite();
};
// The panel outlives the link it shows, so an invite that lapses while it is open has to flip the copy rather
// Than read "expires 5 minutes ago"
const { isExpired } = useCountdown(() => invite.value?.expiresAt);
const inviteLink = computed(() =>
  invite.value ? `${runtimeConfig.public.baseUrl}${RoutePath.MessagesInvite(invite.value.id)}` : "",
);
const remainingUsesText = computed(() => {
  if (!invite.value?.maxUses) return "";
  const remainingUses = invite.value.maxUses - invite.value.uses;
  return `${remainingUses} ${pluralize("use", remainingUses)} remaining.`;
});
const isCopied = ref(false);
</script>

<template>
  <div v-if="room.isInvitePaused" op-medium-emphasis text-body-medium>
    Invites are paused for this room, so no link works and no new one can be created.
  </div>
  <div v-else>
    <div mb-2 flex gap-2>
      <v-select
        v-model="expireAfterMinutes"
        label="Expire after"
        :items="InviteExpireAfterSelectItems"
        density="compact"
        @update:model-value="onUpdateOptions"
      />
      <v-select
        v-model="maxUses"
        label="Max uses"
        :items="InviteMaxUsesSelectItems"
        density="compact"
        @update:model-value="onUpdateOptions"
      />
    </div>
    <v-text-field
      v-model="inviteLink"
      readonly
      bg-color="background"
      :color="isCopied ? 'success' : undefined"
      :placeholder="`${runtimeConfig.public.baseUrl}${RoutePath.MessagesInvite('example')}`"
    >
      <template #append-inner>
        <StyledClipboardButton w-20 :source="inviteLink" @update:copied="isCopied = $event" @create="onCreateInvite" />
      </template>
    </v-text-field>
    <div v-if="invite" pt-2 op-medium-emphasis text-title-small>
      <template v-if="isExpired">Your invite link has expired.</template>
      <template v-else-if="invite.expiresAt">
        Your invite link expires <NuxtTime :datetime="invite.expiresAt" relative />.
      </template>
      <template v-else>Your invite link never expires.</template>
      {{ remainingUsesText }}
    </div>
  </div>
</template>

<style scoped>
:deep(.v-field__input) {
  min-height: auto;
  font-size: 0.875rem;
  line-height: 1.25rem;
}
</style>
