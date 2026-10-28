import type { ProgramInvites } from "#shared/models/resource/program/ProgramInvites";
import type { ProgramStatusRow } from "#shared/models/resource/program/ProgramStatusRow";

import { MimeType } from "#shared/models/file/MimeType";
import { ProgramInviteScope } from "#shared/models/resource/program/ProgramInviteScope";
import { pluralize } from "#shared/util/text/pluralize";
import { formatTruncationCount } from "@/services/dataset/formatTruncationCount";
import { exportPersonalizedHtml } from "@/services/emailEditor/exportPersonalizedHtml";
import { createParticipantLinksCsv } from "@/services/resource/program/createParticipantLinksCsv";
import { createProgramInviteFiles } from "@/services/resource/program/createProgramInviteFiles";
import { getMissingProgramInviteBindings } from "@/services/resource/program/getMissingProgramInviteBindings";
import { getProgramInviteFilename } from "@/services/resource/program/getProgramInviteFilename";
import { getProgramParticipantsFilename } from "@/services/resource/program/getProgramParticipantsFilename";
import { useNotificationStore } from "@/store/notification";
import { useResourceStore } from "@/store/resource";
import { useProgramStore } from "@/store/resource/program";
import { getRouteParam } from "@/util/router/getRouteParam";
import { NotificationSeverity, ResourceType } from "@esposter/db-schema";
import { downloadFile, getResultAsync, RoutePath } from "@esposter/shared";

// The status blade's participants, the command that generates them, and the invite files exported from the same rows.
// The blade reads its rows once, and the export checks against those rows rather than reading them a second time
export const useProgramStatus = () => {
  const { $trpc } = useNuxtApp();
  const { currentRoute } = useRouter();
  const id = computed(() => getRouteParam(currentRoute.value.params, "id"));
  const programStore = useProgramStore();
  const { programResource } = storeToRefs(programStore);
  const resourceStore = useResourceStore();
  const { resource } = storeToRefs(resourceStore);
  const notificationStore = useNotificationStore();
  const { createErrorNotification, createNotification, createWarningNotification } = notificationStore;
  const { executeMutation, isPending: isGeneratePending } = useMutation();
  const statusRows = ref<ProgramStatusRow[]>([]);
  // Set when the response scan hit its cap, which makes every count on this blade a floor rather than a total
  const isRespondedPartial = ref(false);
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
      createWarningNotification("Bind a survey on the Setup blade before generating participants");
      return;
    }
    // Named before the await, so the file is named after the program the command was run on
    const filename = getProgramParticipantsFilename(resource.value?.name ?? "");
    await executeMutation(() => $trpc.program.generateProgramParticipants.mutate({ id: id.value }), {
      key: id.value,
      onError: createErrorNotification,
      onSuccess: async ({ audienceTruncation, participants }) => {
        // The mutation is the one place tokens reach the owner, so its answer leaves as the file of links they send.
        // It holds every participant rather than only the new ones, since re-running never rotates a token already sent
        const participantLinksCsv = createParticipantLinksCsv(
          keyColumn,
          surveyId,
          participants,
          window.location.origin,
        );
        downloadFile(filename, participantLinksCsv, MimeType.Csv);
        createNotification({
          severity: NotificationSeverity.Success,
          title: `${participants.length} participants ready`,
        });
        // A person past the audience read's cap goes unchecked by this run and may hold no link, and the owner is about
        // To send these links
        if (audienceTruncation && audienceTruncation.hiddenRows > 0) {
          const { hiddenRows, isCountCapped } = audienceTruncation;
          createWarningNotification(
            `${formatTruncationCount(hiddenRows, isCountCapped)} audience ${pluralize("row", hiddenRows)} past the read limit were not checked and may have no participant link`,
          );
        }
        await readStatus();
      },
    });
  };
  // The owner's invite export, the invites for everyone or the reminders for those still awaiting. It hands over a file of
  // Personalised emails and reports back as notices
  const exportInviteFiles = (scope: ProgramInviteScope, { emailHtml, invites, unmatchedCount }: ProgramInvites) => {
    const isReminder = scope === ProgramInviteScope.Awaiting;
    // A participant past the audience read's cap has no row to fill, so the file is never sent without them named
    if (unmatchedCount > 0)
      createWarningNotification(
        `${unmatchedCount} ${pluralize("participant", unmatchedCount)} past the audience read limit ${unmatchedCount === 1 ? "was" : "were"} not exported`,
      );
    if (invites.length === 0) {
      createWarningNotification(
        isReminder
          ? "Every participant has responded, so there are no reminders to export"
          : "No participant has an audience row to invite",
      );
      return;
    }
    const surveyPath = RoutePath.View(ResourceType.Survey, programResource.value.surveyId);
    const filename = getProgramInviteFilename(resource.value?.name ?? "", scope);
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
      createWarningNotification(`Bind ${missingBindings.join(", ")} on the Setup blade before exporting invites`);
      return;
    }
    if (statusRows.value.length === 0) {
      createWarningNotification("Generate participants before exporting invites");
      return;
    }
    await getResultAsync(() => $trpc.program.readProgramInvites.query({ id: id.value, scope })).match(
      (programInvites) => {
        exportInviteFiles(scope, programInvites);
      },
      createErrorNotification,
    );
  };

  return { exportInvites, generateParticipants, isGeneratePending, isRespondedPartial, readStatus, statusRows };
};
