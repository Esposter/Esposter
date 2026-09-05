<script setup lang="ts">
import type { ProgramStatusRow } from "#shared/models/resource/program/ProgramStatusRow";

import { RESOURCE_DATE_TIME_ATTRIBUTES } from "@/services/resource/constants";
import { useNotificationStore } from "@/store/notification";
import { useProgramStore } from "@/store/resource/program";
import { getRouteParamString } from "@/util/router/getRouteParamString";
import { NotificationSeverity } from "@esposter/db-schema";
import { getResultAsync } from "@esposter/shared";

const { currentRoute } = useRouter();
const { $trpc } = useNuxtApp();
const programStore = useProgramStore();
const { loadContent } = programStore;
const notificationStore = useNotificationStore();
const { createErrorNotification, createNotification } = notificationStore;
const { executeMutation: executeGenerateMutation, isPending: isGeneratePending } = useMutation();
const id = computed(() => getRouteParamString(currentRoute.value.params.id));
const statusRows = ref<ProgramStatusRow[]>([]);
// Set when the response scan hit its cap, which makes every count on this blade a floor rather than a total
const isRespondedPartial = ref(false);
const respondedCount = computed(() => statusRows.value.filter(({ isResponded }) => isResponded).length);
const HEADERS = [
  { key: "keyValue", title: "Participant" },
  { key: "addedAt", title: "Added" },
  { key: "isResponded", title: "Responded" },
];
const readStatus = async () => {
  await getResultAsync(() => $trpc.program.readProgramStatus.query({ id: id.value })).match((programStatus) => {
    isRespondedPartial.value = programStatus.isRespondedPartial;
    statusRows.value = programStatus.rows;
  }, createErrorNotification);
};
const generateParticipants = async () => {
  await executeGenerateMutation(() => $trpc.program.generateProgramParticipants.mutate({ id: id.value }), {
    key: id.value,
    onError: createErrorNotification,
    onSuccess: async (participants) => {
      createNotification({
        severity: NotificationSeverity.Success,
        title: `${participants.length} participants ready`,
      });
      await readStatus();
    },
  });
};
await loadContent();
await readStatus();
</script>

<template>
  <div p-6 flex flex-col gap-4>
    <div flex flex-wrap gap-4 items-center>
      <span text-h6>Status</span>
      <v-spacer />
      <span op-medium-emphasis>
        {{ isRespondedPartial ? "at least " : "" }}{{ respondedCount }} of {{ statusRows.length }} responded
      </span>
      <StyledButton
        :button-props="{
          disabled: isGeneratePending,
          loading: isGeneratePending,
          prependIcon: 'mdi-ticket-confirmation',
        }"
        @click="generateParticipants"
      >
        Generate participants
      </StyledButton>
    </div>
    <!-- The undercount is in the table too — a participant past the response cap renders as Awaiting — so the
      warning sits above both rather than beside the count -->
    <v-alert
      v-if="isRespondedPartial"
      density="compact"
      type="warning"
      variant="tonal"
      text="This survey holds more responses than one read returns, so some participants shown as awaiting may have already responded."
    />
    <StyledEmptyState
      v-if="statusRows.length === 0"
      icon="mdi-ticket-outline"
      title="No participants yet"
      description="Bind an audience on the Setup blade, then generate participants."
    />
    <v-data-table v-else :headers="HEADERS" :items="statusRows">
      <template #[`item.addedAt`]="{ item }">
        <NuxtTime :="RESOURCE_DATE_TIME_ATTRIBUTES" :datetime="item.addedAt" />
      </template>
      <template #[`item.isResponded`]="{ item }">
        <v-chip v-if="item.isResponded" color="success" size="small">Responded</v-chip>
        <v-chip v-else size="small">Awaiting</v-chip>
      </template>
    </v-data-table>
  </div>
</template>
