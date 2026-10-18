<script setup lang="ts">
import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { ProgramInvites } from "#shared/models/resource/program/ProgramInvites";
import type { ProgramStatusRow } from "#shared/models/resource/program/ProgramStatusRow";

import { MimeType } from "#shared/models/file/MimeType";
import { ProgramInviteScope } from "#shared/models/resource/program/ProgramInviteScope";
import { pluralize } from "#shared/util/text/pluralize";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { sanitizeFilename } from "@/services/app/sanitizeFilename";
import { formatTruncationCount } from "@/services/dataset/formatTruncationCount";
import { exportPersonalizedHtml } from "@/services/emailEditor/exportPersonalizedHtml";
import { RESOURCE_DATE_TIME_ATTRIBUTES } from "@/services/resource/constants";
import { createParticipantLinksCsv } from "@/services/resource/program/createParticipantLinksCsv";
import { createProgramInviteFiles } from "@/services/resource/program/createProgramInviteFiles";
import { getMissingProgramInviteBindings } from "@/services/resource/program/getMissingProgramInviteBindings";
import { ProgramStatusHeaders } from "@/services/resource/program/ProgramStatusHeaders";
import { DATA_TABLE_ITEMS_PER_PAGE_OPTIONS } from "@/services/ui/constants";
import { useNotificationStore } from "@/store/notification";
import { useResourceStore } from "@/store/resource";
import { useProgramStore } from "@/store/resource/program";
import { getRouteParam } from "@/util/router/getRouteParam";
import { NotificationSeverity, ResourceType, SurveyResponseMode } from "@esposter/db-schema";
import { downloadFile, getResultAsync, RoutePath } from "@esposter/shared";

const { currentRoute } = useRouter();
const { $trpc } = useNuxtApp();
const programStore = useProgramStore();
const { loadContent } = programStore;
const { programResource } = storeToRefs(programStore);
const resourceStore = useResourceStore();
const { resource } = storeToRefs(resourceStore);
const notificationStore = useNotificationStore();
const { createErrorNotification, createNotification } = notificationStore;
const { executeMutation: executeGenerateMutation, isPending: isGeneratePending } = useMutation();
const id = computed(() => getRouteParam(currentRoute.value.params, "id"));
const statusRows = ref<ProgramStatusRow[]>([]);
const { data: surveyContent, refresh: refreshSurveyContent } = useQuery(
  () => $trpc.survey.readResourceContent.query({ id: programResource.value.surveyId }),
  { isLazy: true },
);
const isAnonymousSurvey = computed(() => surveyContent.value?.settings.responseMode === SurveyResponseMode.Anonymous);
// Set when the response scan hit its cap, which makes every count on this blade a floor rather than a total
const isRespondedPartial = ref(false);
// A participant is keyed by the key column's value, which the program dedupes on
// oxlint-disable-next-line oxc/no-map-spread -- each item is a new object, never a read row mutated in place
const items = computed(() => statusRows.value.map((row) => ({ ...row, id: row.keyValue })));
const itemsPerPage = ref(DATA_TABLE_ITEMS_PER_PAGE_OPTIONS[0]);
const page = ref(1);
const sortBy = ref<SortItem<string>[]>([]);
const respondedCount = computed(() => statusRows.value.filter(({ isResponded }) => isResponded).length);
const respondedPercentage = computed(() =>
  statusRows.value.length > 0 ? Math.round((respondedCount.value / statusRows.value.length) * 100) : 0,
);
const exportInviteFiles = (scope: ProgramInviteScope, { emailHtml, invites, unmatchedCount }: ProgramInvites) => {
  const isReminder = scope === ProgramInviteScope.Awaiting;
  // A participant past the audience read's cap has no row to fill, so the file is never sent without them named
  if (unmatchedCount > 0)
    createNotification({
      severity: NotificationSeverity.Warning,
      title: `${unmatchedCount} ${pluralize("participant", unmatchedCount)} past the audience read limit ${unmatchedCount === 1 ? "was" : "were"} not exported`,
    });
  if (invites.length === 0) {
    createNotification({
      severity: NotificationSeverity.Warning,
      title: isReminder
        ? "Every participant has responded, so there are no reminders to export"
        : "No participant has an audience row to invite",
    });
    return;
  }
  const { surveyId } = programResource.value;
  const surveyPath = RoutePath.View(ResourceType.Survey, surveyId);
  const filename = `${sanitizeFilename(resource.value?.name ?? "")}-${isReminder ? "reminders" : "invites"}`;
  const count = exportPersonalizedHtml(filename, createProgramInviteFiles(emailHtml, surveyPath, invites));
  createNotification({
    severity: NotificationSeverity.Success,
    title: `${count} ${pluralize(isReminder ? "reminder" : "invite", count)} ready`,
  });
};
const exportInvites = async (scope: ProgramInviteScope) => {
  // Each binding an invite reads is named when missing, rather than exporting an empty zip
  const missingBindings = getMissingProgramInviteBindings(programResource.value);
  if (missingBindings.length > 0) {
    createNotification({
      severity: NotificationSeverity.Warning,
      title: `Bind ${missingBindings.join(", ")} on the Setup blade before exporting invites`,
    });
    return;
  }
  if (statusRows.value.length === 0) {
    createNotification({
      severity: NotificationSeverity.Warning,
      title: "Generate participants before exporting invites",
    });
    return;
  }
  await getResultAsync(() => $trpc.program.readProgramInvites.query({ id: id.value, scope })).match(
    (programInvites) => exportInviteFiles(scope, programInvites),
    createErrorNotification,
  );
};
const readStatus = async () => {
  await getResultAsync(() => $trpc.program.readProgramStatus.query({ id: id.value })).match((programStatus) => {
    isRespondedPartial.value = programStatus.isRespondedPartial;
    statusRows.value = programStatus.rows;
  }, createErrorNotification);
};
const generateParticipants = async () => {
  // A participant's link opens the bound survey, so without one there is nothing to hand the owner
  const { keyColumn, surveyId } = programResource.value;
  if (!surveyId) {
    createNotification({
      severity: NotificationSeverity.Warning,
      title: "Bind a survey on the Setup blade before generating participants",
    });
    return;
  }
  // Named before the await, so the file is named after the program the command was run on
  const filename = `${sanitizeFilename(resource.value?.name ?? "")}-participants.csv`;
  await executeGenerateMutation(() => $trpc.program.generateProgramParticipants.mutate({ id: id.value }), {
    key: id.value,
    onError: createErrorNotification,
    onSuccess: async ({ audienceTruncation, participants }) => {
      // The mutation is the one place tokens reach the owner, so its answer leaves as the file of links they send.
      // It holds every participant rather than only the new ones, since re-running never rotates a token already sent
      const participantLinksCsv = createParticipantLinksCsv(keyColumn, surveyId, participants, window.location.origin);
      downloadFile(filename, participantLinksCsv, MimeType.Csv);
      createNotification({
        severity: NotificationSeverity.Success,
        title: `${participants.length} participants ready`,
      });
      // A person past the audience read's cap goes unchecked by this run and may hold no link, and the owner is about
      // To send these links
      if (audienceTruncation && audienceTruncation.hiddenRows > 0) {
        const { hiddenRows, isCountCapped } = audienceTruncation;
        createNotification({
          severity: NotificationSeverity.Warning,
          title: `${formatTruncationCount(hiddenRows, isCountCapped)} audience ${pluralize("row", hiddenRows)} past the read limit were not checked and may have no participant link`,
        });
      }
      await readStatus();
    },
  });
};
await loadContent();
await Promise.all([readStatus(), programResource.value.surveyId ? refreshSurveyContent() : Promise.resolve()]);
</script>

<template>
  <div p-4 flex flex-col gap-4 ui-body>
    <!-- The count reads beside the heading it describes and yields its width first, so the row never wraps -->
    <div flex gap-4 items-center>
      <h2 ui-heading>Status</h2>
      <p text-sm text-muted flex-1 min-w-0 truncate>
        {{ isRespondedPartial ? "at least " : "" }}{{ respondedCount }} of {{ statusRows.length }} responded
      </p>
      <UiButton @click="exportInvites(ProgramInviteScope.All)">Export invites</UiButton>
      <UiButton @click="exportInvites(ProgramInviteScope.Awaiting)">Export reminders</UiButton>
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
    <ResourceProgramSurveyModeWarning v-if="isAnonymousSurvey && respondedCount === 0" />
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
  </div>
</template>
