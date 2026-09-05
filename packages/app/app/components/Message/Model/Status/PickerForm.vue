<script setup lang="ts">
import { SelectableStatusDefinitionList } from "@/models/message/user/status/SelectableStatusDefinitionList";
import { StatusIconMap } from "@/models/message/user/status/StatusIconMap";
import { MutationStatus } from "@/models/shared/MutationStatus";
import { authClient } from "@/services/auth/authClient";
import { StatusBadgePropsMap } from "@/services/message/StatusBadgePropsMap";
import { useStatusStore } from "@/store/message/user/status";
import { STATUS_MESSAGE_MAX_LENGTH } from "@esposter/db-schema";
import { noop } from "@esposter/shared";

const emit = defineEmits<{ save: [] }>();
const { $trpc } = useNuxtApp();
// Nothing here renders until the menu above it is opened by a click, so the session is never wanted at SSR time
const session = authClient.useSession();
const userId = computed(() => session.value.data?.user.id ?? "");
const statusStore = useStatusStore();
const { getStatusMessage, getStoredUserStatus, getUserStatus, storeStatus } = statusStore;
// A manual draft, seeded once per open: the menu unmounts its content on close, so every open builds this form
// Again against the row as it then stands. Automatic sync would re-seed on any write to the status map, and the
// Map carries more than these two fields — a presence push landing while the user is mid-sentence would clear
// What they had typed, having changed only the connection state
const { cloned: editedStatus, sync: syncEditedStatus } = useCloned(
  () => ({ message: getStatusMessage(userId.value), status: getUserStatus(userId.value) }),
  { manual: true },
);
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
  // Roll back — re-seed from the row either way, or that one case reopens the menu showing a refused value
  if (status === MutationStatus.Failed) syncEditedStatus();
};
</script>

<template>
  <StyledCard p-3 flex flex-col gap-2>
    <div font-bold text-title-small>Set Status</div>
    <v-list density="compact" py-0>
      <v-list-item
        v-for="{ label, status: selectableStatus, subtitle } in SelectableStatusDefinitionList"
        :key="selectableStatus"
        :active="selectableStatus === editedStatus.status"
        :subtitle
        rd
        @click="
          () => {
            if (selectableStatus === editedStatus.status) save();
            else editedStatus.status = selectableStatus;
          }
        "
      >
        <template #prepend>
          <v-icon
            mr-2
            size="small"
            :color="StatusBadgePropsMap[selectableStatus].color"
            :icon="StatusIconMap[selectableStatus]"
          />
        </template>
        <v-list-item-title>{{ label }}</v-list-item-title>
      </v-list-item>
    </v-list>
    <v-divider />
    <v-text-field
      v-model="editedStatus.message"
      label="What's on your mind?"
      density="compact"
      :maxlength="STATUS_MESSAGE_MAX_LENGTH"
    />
    <StyledButton text="Save" @click="save()" />
  </StyledCard>
</template>
