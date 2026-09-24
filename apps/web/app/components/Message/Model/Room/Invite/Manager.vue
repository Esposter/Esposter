<script setup lang="ts">
import type { CreateInviteInput } from "#shared/models/db/room/CreateInviteInput";
import type { UiSelectItem } from "@/models/ui/UiSelectItem";
import type { RoomInMessage } from "@esposter/db-schema";

import { DEFAULT_INVITE_EXPIRE_AFTER_MINUTES, INVITE_MAX_USES_OPTIONS } from "#shared/services/room/invite/constants";
import { getSynchronizedFunction } from "#shared/util/function/getSynchronizedFunction";
import { pluralize } from "#shared/util/text/pluralize";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { getInviteLink } from "@/services/message/room/invite/getInviteLink";
import { InviteExpireAfterSelectItems } from "@/services/message/room/invite/InviteExpireAfterSelectItems";
import { InviteMaxUsesSelectItems } from "@/services/message/room/invite/InviteMaxUsesSelectItems";
import { useInviteStore } from "@/store/message/room/invite";

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
// A select holds a string, so each option carries its number as one and is read back through the list it came from
const expireAfterItems = InviteExpireAfterSelectItems.map<UiSelectItem<string>>(({ title, value }) => ({
  meaning: UiIconMeaning.Timer,
  title,
  value: String(value),
}));
const maxUsesItems = InviteMaxUsesSelectItems.map<UiSelectItem<string>>(({ title, value }) => ({
  meaning: UiIconMeaning.Members,
  title,
  value: String(value),
}));
const selectedExpireAfter = computed({
  get: () => String(expireAfterMinutes.value),
  set: (newValue) => {
    const item = InviteExpireAfterSelectItems.find(({ value }) => String(value) === newValue);
    if (item) expireAfterMinutes.value = item.value;
  },
});
const selectedMaxUses = computed({
  get: () => String(maxUses.value),
  set: (newValue) => {
    const item = InviteMaxUsesSelectItems.find(({ value }) => String(value) === newValue);
    if (item) maxUses.value = item.value;
  },
});
const createRoomInvite = () =>
  createInvite({ expireAfterMinutes: expireAfterMinutes.value, maxUses: maxUses.value, roomId: room.id });
useReadMyInvite(room.id, (newInvite) => {
  // Seed from the loaded invite so regenerating via one option doesn't silently reset the other to unlimited
  // (expireAfterMinutes can't be recovered from the absolute expiresAt, so it falls back to the default)
  maxUses.value = INVITE_MAX_USES_OPTIONS.find((uses) => uses === newInvite?.maxUses) ?? 0;
  // Discord hands the reader a link the moment the dialog opens rather than an empty field with a button on it.
  // A member holds at most one, so a read that finds none mints it here — and one that finds a live link never
  // Replaces it, which is what asking for the create would have risked
  if (!newInvite && !room.isInvitePaused) getSynchronizedFunction(createRoomInvite)();
});
// Changing options with a live link regenerates it — the old link is replaced (one invite per member per room)
const onUpdateOptions = async () => {
  if (invite.value) await createRoomInvite();
};
// The panel outlives the link it shows, so an invite that lapses while it is open has to flip the copy rather
// Than read "expires 5 minutes ago"
const { isExpired } = useCountdown(() => invite.value?.expiresAt);
const inviteLink = computed(() => (invite.value ? getInviteLink(runtimeConfig.public.baseUrl, invite.value.id) : ""));
const remainingUsesText = computed(() => {
  if (!invite.value?.maxUses) return "";
  const remainingUses = invite.value.maxUses - invite.value.uses;
  return `${remainingUses} ${pluralize("use", remainingUses)} remaining.`;
});
const { copied, copy } = useClipboard({ legacy: true });
</script>

<template>
  <UiAlert v-if="room.isInvitePaused" status="info">
    Invites are paused for this room, so no link works and no new one can be created.
  </UiAlert>
  <div v-else flex flex-col gap-3>
    <div gap-2 grid cols-2>
      <div flex flex-col gap-1 min-w-0>
        <span text-sm text-muted>Expire after</span>
        <UiSelect
          v-model="selectedExpireAfter"
          :items="expireAfterItems"
          label="Expire after"
          @update:model-value="onUpdateOptions"
        />
      </div>
      <div flex flex-col gap-1 min-w-0>
        <span text-sm text-muted>Max uses</span>
        <UiSelect
          v-model="selectedMaxUses"
          :items="maxUsesItems"
          label="Max uses"
          @update:model-value="onUpdateOptions"
        />
      </div>
    </div>
    <!-- Discord's field: the link, and the one button that copies it, which says so in the success colour a moment -->
    <div pl-2 flex gap-2 items-center ui-field>
      <code :class="{ 'text-success': copied, 'text-muted': !inviteLink }" flex-1 min-w-0 truncate>
        {{ inviteLink || getInviteLink(runtimeConfig.public.baseUrl, "example") }}
      </code>
      <UiButton v-if="inviteLink" :variant="UiButtonVariant.Accent" @click="copy(inviteLink)">
        {{ copied ? "Copied" : "Copy" }}
      </UiButton>
      <UiButton v-else :variant="UiButtonVariant.Accent" @click="createRoomInvite()">Create</UiButton>
    </div>
    <p v-if="invite" text-sm text-muted>
      <template v-if="isExpired">Your invite link has expired.</template>
      <template v-else-if="invite.expiresAt">
        Your invite link expires <NuxtTime :datetime="invite.expiresAt" relative />.
      </template>
      <template v-else>Your invite link never expires.</template>
      {{ remainingUsesText }}
    </p>
  </div>
</template>
