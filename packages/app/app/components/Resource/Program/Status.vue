<script setup lang="ts">
import type { ProgramStatusRow } from "#shared/models/resource/program/ProgramStatusRow";

import { dayjs } from "#shared/services/dayjs";
import { RESOURCE_DATE_FORMAT } from "@/services/resource/constants";
import { useNotificationStore } from "@/store/notification";
import { useProgramStore } from "@/store/resource/program";
import { getResultAsync } from "@esposter/shared";

const route = useRoute();
const { $trpc } = useNuxtApp();
const programStore = useProgramStore();
const { loadContent } = programStore;
const notificationStore = useNotificationStore();
const { createNotification } = notificationStore;
const executeGenerateMutation = useMutation();
const id = computed(() => (Array.isArray(route.params.id) ? (route.params.id[0] ?? "") : (route.params.id ?? "")));
const statusRows = ref<ProgramStatusRow[]>([]);
const isLoading = ref(true);
const respondedCount = computed(() => statusRows.value.filter(({ isResponded }) => isResponded).length);
const headers = [
  { key: "keyValue", title: "Recipient" },
  { key: "invitedAt", title: "Invited" },
  { key: "isResponded", title: "Responded" },
];
const readStatus = async () => {
  await getResultAsync(() => $trpc.program.readProgramStatus.query({ id: id.value })).match(
    (newStatusRows) => {
      statusRows.value = newStatusRows;
    },
    (error) => {
      createNotification({ severity: "error", title: error.message });
    },
  );
};
const generateInvites = async () => {
  await executeGenerateMutation(() => $trpc.program.generateProgramInvites.mutate({ id: id.value }), {
    onError: (error) => {
      createNotification({ severity: "error", title: error.message });
    },
    onSuccess: async (invites) => {
      createNotification({ severity: "success", title: `${invites.length} invites ready` });
      await readStatus();
    },
  });
};

onMounted(async () => {
  await loadContent();
  await readStatus();
  isLoading.value = false;
});
</script>

<template>
  <StyledSkeleton v-if="isLoading" />
  <div v-else p-6 flex flex-col gap-4>
    <div flex flex-wrap gap-4 items-center>
      <span text-h6>Status</span>
      <v-spacer />
      <span op-medium-emphasis>{{ respondedCount }} of {{ statusRows.length }} responded</span>
      <StyledButton :button-props="{ prependIcon: 'mdi-ticket-confirmation' }" @click="generateInvites">
        Generate invites
      </StyledButton>
    </div>
    <StyledEmptyState
      v-if="statusRows.length === 0"
      icon="mdi-ticket-outline"
      title="No invites yet"
      description="Bind an audience on the Setup blade, then generate invites."
    />
    <v-data-table v-else :headers :items="statusRows">
      <template #[`item.invitedAt`]="{ item }">{{ dayjs(item.invitedAt).format(RESOURCE_DATE_FORMAT) }}</template>
      <template #[`item.isResponded`]="{ item }">
        <v-chip v-if="item.isResponded" color="success" size="small">Responded</v-chip>
        <v-chip v-else size="small">Invited</v-chip>
      </template>
    </v-data-table>
  </div>
</template>
