<script setup lang="ts">
import type { ProgramStatusRow } from "#shared/models/resource/program/ProgramStatusRow";

import { dayjs } from "#shared/services/dayjs";
import { RESOURCE_DATE_FORMAT } from "@/services/resource/constants";
import { useNotificationStore } from "@/store/notification";
import { useProgramStore } from "@/store/resource/program";
import { getRouteParamString } from "@/util/router/getRouteParamString";
import { getResultAsync } from "@esposter/shared";

const route = useRoute();
const { $trpc } = useNuxtApp();
const programStore = useProgramStore();
const { loadContent } = programStore;
const notificationStore = useNotificationStore();
const { createErrorNotification, createNotification } = notificationStore;
const { executeMutation: executeGenerateMutation, isPending: isGeneratePending } = useMutation();
const id = computed(() => getRouteParamString(route.params.id));
const statusRows = ref<ProgramStatusRow[]>([]);
const respondedCount = computed(() => statusRows.value.filter(({ isResponded }) => isResponded).length);
const headers = [
  { key: "keyValue", title: "Participant" },
  { key: "addedAt", title: "Added" },
  { key: "isResponded", title: "Responded" },
];
const readStatus = async () => {
  await getResultAsync(() => $trpc.program.readProgramStatus.query({ id: id.value })).match((newStatusRows) => {
    statusRows.value = newStatusRows;
  }, createErrorNotification);
};
const generateParticipants = async () => {
  await executeGenerateMutation(() => $trpc.program.generateProgramParticipants.mutate({ id: id.value }), {
    key: id.value,
    onError: createErrorNotification,
    onSuccess: async (participants) => {
      createNotification({ severity: "success", title: `${participants.length} participants ready` });
      await readStatus();
    },
  });
};
// The Suspense-wrapped blade awaits the content and the rows it renders, so it opens populated and the
// Shell's skeleton covers the wait — no per-blade loading flag
await loadContent();
await readStatus();
</script>

<template>
  <div p-6 flex flex-col gap-4>
    <div flex flex-wrap gap-4 items-center>
      <span text-h6>Status</span>
      <v-spacer />
      <span op-medium-emphasis>{{ respondedCount }} of {{ statusRows.length }} responded</span>
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
    <StyledEmptyState
      v-if="statusRows.length === 0"
      icon="mdi-ticket-outline"
      title="No participants yet"
      description="Bind an audience on the Setup blade, then generate participants."
    />
    <v-data-table v-else :headers :items="statusRows">
      <template #[`item.addedAt`]="{ item }">{{ dayjs(item.addedAt).format(RESOURCE_DATE_FORMAT) }}</template>
      <template #[`item.isResponded`]="{ item }">
        <v-chip v-if="item.isResponded" color="success" size="small">Responded</v-chip>
        <v-chip v-else size="small">Awaiting</v-chip>
      </template>
    </v-data-table>
  </div>
</template>
