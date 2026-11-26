<script setup lang="ts">
import type { UserStatus } from "@esposter/db-schema";

import { UiButtonVariant } from "#src/models/ui/UiButtonVariant";
import { SelectableStatusDefinitionList } from "#src/services/message/user/status/SelectableStatusDefinitionList";
import { StatusIconMap } from "#src/services/message/user/status/StatusIconMap";
import { StatusTokenMap } from "#src/services/message/user/status/StatusTokenMap";
import { UiRules } from "#src/services/ui/UiRules";
import { useStatusStore } from "#src/store/message/user/status";
import { STATUS_MESSAGE_MAX_LENGTH } from "@esposter/db-schema";

const emit = defineEmits<{ save: [] }>();
// Nothing here renders until the popover above it is opened by a click, so the session is never wanted at SSR time
const userId = useSessionUserId();
const messageRules = [UiRules.maxLength(STATUS_MESSAGE_MAX_LENGTH)];
const statusStore = useStatusStore();
const { getStatusMessage, getUserStatus, setStatus } = statusStore;
// A manual draft, seeded once per open: the popover mounts this form only while it is open, so every open builds it
// Again against the row as it then stands. Automatic sync would re-seed on any write to the status map, and the
// Map carries more than these two fields — a presence push landing while the user is mid-sentence would clear
// What they had typed, having changed only the connection state
const { cloned: editedStatus } = useCloned(
  () => ({ message: getStatusMessage(userId.value), status: getUserStatus(userId.value) }),
  { manual: true },
);
const statusItems = SelectableStatusDefinitionList.map(({ label, status, subtitle }) => ({
  description: subtitle,
  icon: StatusIconMap[status],
  title: label,
  value: status,
}));
const selectedStatuses = computed(() => [editedStatus.value.status]);
const isValid = ref(true);
const save = () => {
  // The write is filed under the person's own row, so without a session there is nothing to file it under and none is
  // Sent
  if (!userId.value) return;

  emit("save");
  setStatus({ ...editedStatus.value });
};
</script>

<template>
  <div w="[min(20rem,80dvw)]" flex flex-col gap-3>
    <h2 ui-heading>Set status</h2>
    <!-- Picking the status already chosen saves at once, so setting only a status is one click -->
    <UiList
      :model-value="selectedStatuses"
      :items="statusItems"
      label="Status"
      @select="(status: UserStatus) => {
        if (status === editedStatus.status) save();
        else editedStatus.status = status;
      }"
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
