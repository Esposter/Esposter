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
const { statusMap } = storeToRefs(statusStore);
const { getStatusEnum, getStatusMessage } = statusStore;
// The stored row owns both values and this is only a draft of them, so it re-seeds whenever the row moves.
// The menu closes the instant a save is submitted, which is what makes the draft disposable: the user has no
// Screen left to correct it on, and the next open sits beside a status bar reading the row
const { cloned: editedStatus, sync: syncEditedStatus } = useCloned(() => ({
  message: getStatusMessage(userId.value),
  status: getStatusEnum(userId.value),
}));
const { executeMutation } = useMutation();
const save = async () => {
  emit("save");
  const input = { ...editedStatus.value };
  const { status } = await executeMutation(() => $trpc.user.upsertStatus.mutate(input), {
    // Read as the write is sent, so a rejected save restores what the save ahead of it stored rather than the
    // Status on screen when the user clicked. Nothing is applied when there is no record yet — the row carries
    // Fields only the server can fill in, so it is left to onSuccess
    applyOptimistic: () => {
      const previousStatus = statusMap.value.get(userId.value);
      if (!previousStatus) return noop;

      const { message: previousMessage, status: previousUserStatus } = previousStatus;
      statusMap.value.set(userId.value, { ...previousStatus, ...input });
      return () => {
        // Only the two fields this write moved, against the record as it stands — reinstating the row as a
        // Whole would undo the connection state a presence push landed while this write was in flight
        const currentStatus = statusMap.value.get(userId.value);
        if (currentStatus)
          statusMap.value.set(userId.value, {
            ...currentStatus,
            message: previousMessage,
            status: previousUserStatus,
          });
      };
    },
    key: userId.value,
    onSuccess: ({ userId: upsertedUserId, ...rest }) => {
      statusMap.value.set(upsertedUserId, rest);
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
      hide-details
      :maxlength="STATUS_MESSAGE_MAX_LENGTH"
    />
    <StyledButton text="Save" @click="save()" />
  </StyledCard>
</template>
