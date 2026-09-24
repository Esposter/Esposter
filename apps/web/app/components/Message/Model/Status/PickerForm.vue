<script setup lang="ts">
import type { UserStatus } from "@esposter/db-schema";

import { MutationStatus } from "@/models/shared/MutationStatus";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { authClient } from "@/services/auth/authClient";
import { SelectableStatusDefinitionList } from "@/services/message/user/status/SelectableStatusDefinitionList";
import { StatusIconMap } from "@/services/message/user/status/StatusIconMap";
import { StatusTokenMap } from "@/services/message/user/status/StatusTokenMap";
import { useStatusStore } from "@/store/message/user/status";
import { STATUS_MESSAGE_MAX_LENGTH } from "@esposter/db-schema";
import { noop } from "@esposter/shared";

const emit = defineEmits<{ save: [] }>();
const { $trpc } = useNuxtApp();
// Nothing here renders until the popover above it is opened by a click, so the session is never wanted at SSR time
const session = authClient.useSession();
const userId = computed(() => session.value.data?.user.id ?? "");
const rules = useVRules();
const messageRules = computed(() => [rules.maxLength(STATUS_MESSAGE_MAX_LENGTH)]);
const statusStore = useStatusStore();
const { getStatusMessage, getStoredUserStatus, getUserStatus, storeStatus } = statusStore;
// A manual draft, seeded once per open: the popover mounts this form only while it is open, so every open builds it
// Again against the row as it then stands. Automatic sync would re-seed on any write to the status map, and the
// Map carries more than these two fields — a presence push landing while the user is mid-sentence would clear
// What they had typed, having changed only the connection state
const { cloned: editedStatus, sync: syncEditedStatus } = useCloned(
  () => ({ message: getStatusMessage(userId.value), status: getUserStatus(userId.value) }),
  { manual: true },
);
const statusItems = SelectableStatusDefinitionList.map(({ label, status, subtitle }) => ({
  description: subtitle,
  icon: StatusIconMap[status],
  title: label,
  value: status,
}));
const isValid = ref(true);
const { executeMutation } = useMutation();
const save = async () => {
  // Every piece of bookkeeping below is keyed by the user: the queue key, the optimistic read, the row the
  // Rollback restores. Without a session there is no key to write under, and the mutation would only be
  // Refused anyway — so the save is not attempted rather than filed against `""`
  if (!userId.value) return;

  emit("save");
  const input = { ...editedStatus.value };
  const { status } = await executeMutation(() => $trpc.user.upsertStatus.mutate(input), {
    // Nothing is applied when there is no record yet — the row carries fields only the server can fill in, so a
    // First status is left to onSuccess
    applyOptimistic: () => {
      const previousStatus = getStoredUserStatus(userId.value);
      if (!previousStatus) return noop;

      const { message: previousMessage, status: previousUserStatus } = previousStatus;
      storeStatus(userId.value, { ...previousStatus, ...input });
      return () => {
        const currentStatus = getStoredUserStatus(userId.value);
        if (currentStatus)
          storeStatus(userId.value, { ...currentStatus, message: previousMessage, status: previousUserStatus });
      };
    },
    key: userId.value,
    onSuccess: ({ userId: upsertedUserId, ...rest }) => {
      storeStatus(upsertedUserId, rest);
    },
  });
  // A rollback moves the row and the clone follows it, but a first status the server refuses leaves no row to
  // Roll back — re-seed from the row either way, or that one case reopens the popover showing a refused value
  if (status === MutationStatus.Failed) syncEditedStatus();
};
</script>

<template>
  <div w="[min(20rem,80dvw)]" flex flex-col gap-3>
    <h2 ui-heading>Set status</h2>
    <!-- Picking the status already chosen saves at once, so setting only a status is one click -->
    <UiList
      :model-value="[editedStatus.status]"
      :items="statusItems"
      label="Status"
      @select="
        (status: UserStatus) => {
          if (status === editedStatus.status) save();
          else editedStatus.status = status;
        }
      "
    >
      <template #mark="{ item }">
        <span :class="item.icon" :style="{ color: `var(--ui-${StatusTokenMap[item.value]})` }" size-6 />
      </template>
    </UiList>
    <UiForm v-model:is-valid="isValid" flex flex-col gap-3 @submit="save()">
      <UiTextField
        v-model="editedStatus.message"
        :counter="STATUS_MESSAGE_MAX_LENGTH"
        label="What's on your mind?"
        :rules="messageRules"
      />
      <UiButton :disabled="!isValid" type="submit" :variant="UiButtonVariant.Accent">Save</UiButton>
    </UiForm>
  </div>
</template>
