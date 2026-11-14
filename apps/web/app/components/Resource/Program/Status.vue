<script setup lang="ts">
import type { SortItem } from "#shared/models/pagination/sorting/SortItem";

import { ProgramInviteScope } from "#shared/models/resource/program/ProgramInviteScope";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { RESOURCE_DATE_TIME_ATTRIBUTES } from "@/services/resource/constants";
import { ProgramStatusHeaders } from "@/services/resource/program/ProgramStatusHeaders";
import { DATA_TABLE_ITEMS_PER_PAGE_OPTIONS } from "@/services/ui/constants";
import { useProgramStore } from "@/store/resource/program";
import { SurveyResponseMode } from "@esposter/db-schema";

const { $trpc } = useNuxtApp();
const programStore = useProgramStore();
const { loadContent } = programStore;
const { programResource } = storeToRefs(programStore);
const {
  exportInvites,
  generateParticipants,
  isGeneratePending,
  isRespondedPartial,
  issuedLink,
  readStatus,
  regenerateParticipantLink,
  statusRows,
} = useProgramStatus();
// Exporting and regenerating both issue links afresh, so the links already sent stop working: each waits on a confirm
const exportScope = ref(ProgramInviteScope.All);
const isExportConfirmOpen = ref(false);
const regeneratingKeyValue = ref("");
const isRegenerateConfirmOpen = ref(false);
const isIssuedLinkOpen = computed({
  get: () => issuedLink.value !== "",
  set: (isOpen) => {
    if (!isOpen) issuedLink.value = "";
  },
});
const askExportInvites = (scope: ProgramInviteScope) => {
  exportScope.value = scope;
  isExportConfirmOpen.value = true;
};
const askRegenerateLink = (keyValue: string) => {
  regeneratingKeyValue.value = keyValue;
  isRegenerateConfirmOpen.value = true;
};
const { data: surveyContent, refresh: refreshSurveyContent } = useQuery(
  () => $trpc.survey.readResourceContent.query({ id: programResource.value.surveyId }),
  { isLazy: true },
);
// A participant is keyed by the key column's value, which the program dedupes on
const items = computed(() => statusRows.value.map((row) => ({ ...row, id: row.keyValue })));
const itemsPerPage = ref(DATA_TABLE_ITEMS_PER_PAGE_OPTIONS[0]);
const page = ref(1);
const sortBy = ref<SortItem<string>[]>([]);
const respondedCount = computed(() => statusRows.value.filter(({ isResponded }) => isResponded).length);
const respondedPercentage = computed(() =>
  statusRows.value.length > 0 ? Math.round((respondedCount.value / statusRows.value.length) * 100) : 0,
);

await loadContent();
await Promise.all([readStatus(), programResource.value.surveyId ? refreshSurveyContent() : Promise.resolve()]);
</script>

<template>
  <div p-4 flex flex-col gap-4 ui-body>
    <!-- The count reads beside the heading it describes and yields its width first, so the row wraps only when the
      buttons cannot all fit beside the heading -->
    <div flex flex-wrap gap-4 items-center>
      <h2 ui-heading>Status</h2>
      <p text-sm text-muted flex-1 min-w-0 truncate>
        {{ isRespondedPartial ? "at least " : "" }}{{ respondedCount }} of {{ statusRows.length }} responded
      </p>
      <UiButton @click="askExportInvites(ProgramInviteScope.All)">Export invites</UiButton>
      <UiButton @click="askExportInvites(ProgramInviteScope.Awaiting)">Export reminders</UiButton>
      <UiButton :is-pending="isGeneratePending" :variant="UiButtonVariant.Accent" @click="generateParticipants()">
        Generate participants
      </UiButton>
    </div>
    <!-- The funnel at a glance: how far along the audience is, filling as participants answer. A response rate has no
      worse end, so it takes neither mark and stays in the accent -->
    <UiMeter
      v-if="statusRows.length > 0"
      label="Response rate"
      :value="respondedPercentage"
      :value-text="`${isRespondedPartial ? 'at least ' : ''}${respondedPercentage}% responded`"
    />
    <ResourceProgramSurveyModeWarning
      v-if="surveyContent?.settings.responseMode === SurveyResponseMode.Anonymous && respondedCount === 0"
    />
    <!-- The undercount is in the table too — a participant past the response cap renders as Awaiting — so the
      warning sits above both rather than beside the count -->
    <UiAlert v-if="isRespondedPartial" status="warning">
      This survey holds more responses than one read returns, so some participants shown as awaiting may have already
      responded.
    </UiAlert>
    <UiDataTable
      v-model:items-per-page="itemsPerPage"
      v-model:page="page"
      v-model:sort-by="sortBy"
      :columns="ProgramStatusHeaders"
      :get-item-title="({ keyValue }) => keyValue"
      :items
      :items-per-page-options="DATA_TABLE_ITEMS_PER_PAGE_OPTIONS"
      label="Participants"
    >
      <template #cell="{ column, item, value }">
        <NuxtTime v-if="column.key === 'addedAt'" :="RESOURCE_DATE_TIME_ATTRIBUTES" :datetime="item.addedAt" />
        <UiIconButton
          v-else-if="column.key === 'link'"
          label="Regenerate link"
          :meaning="UiIconMeaning.Refresh"
          :variant="UiButtonVariant.Quiet"
          @click="askRegenerateLink(item.keyValue)"
        />
        <span v-else-if="column.key === 'isResponded'" flex gap-2 items-center>
          <UiIcon
            :class="item.isResponded ? 'text-success' : 'text-muted'"
            :meaning="item.isResponded ? UiIconMeaning.Success : UiIconMeaning.Awaiting"
          />
          {{ item.isResponded ? "Responded" : "Awaiting" }}
        </span>
        <template v-else>{{ value }}</template>
      </template>
      <template #empty>
        <UiEmptyState
          description="Bind an audience on the Setup blade, then generate participants."
          :meaning="UiIconMeaning.Group"
          title="No participants yet"
        />
      </template>
    </UiDataTable>
    <UiConfirmDialog
      v-model="isExportConfirmOpen"
      confirm-label="Export"
      title="Export invites"
      :confirm="() => exportInvites(exportScope)"
    >
      <p>
        Each participant in this file gets a new link, and the links already sent to them stop working. Their answers
        stay with them.
      </p>
    </UiConfirmDialog>
    <UiConfirmDialog
      v-model="isRegenerateConfirmOpen"
      confirm-label="Regenerate"
      title="Regenerate link"
      :confirm="() => regenerateParticipantLink(regeneratingKeyValue)"
    >
      <p>
        Regenerate the link for {{ regeneratingKeyValue }}? The link already sent to them stops working. Their answer
        stays with them.
      </p>
    </UiConfirmDialog>
    <UiDialog v-model="isIssuedLinkOpen" title="Participant link">
      <p>Copy this link now. It won't be shown again, so if it is lost, regenerate the link for a new one.</p>
      <div flex gap-2 items-center>
        <p flex-1 min-w-0 break-all>{{ issuedLink }}</p>
        <UiCopyButton :source="issuedLink" label="Copy link" />
      </div>
    </UiDialog>
  </div>
</template>
