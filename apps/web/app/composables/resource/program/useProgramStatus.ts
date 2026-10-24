import type { ProgramStatusRow } from "#shared/models/resource/program/ProgramStatusRow";

import { MimeType } from "#shared/models/file/MimeType";
import { pluralize } from "#shared/util/text/pluralize";
import { formatTruncationCount } from "@/services/dataset/formatTruncationCount";
import { createParticipantLinksCsv } from "@/services/resource/program/createParticipantLinksCsv";
import { getProgramParticipantsFilename } from "@/services/resource/program/getProgramParticipantsFilename";
import { useNotificationStore } from "@/store/notification";
import { useResourceStore } from "@/store/resource";
import { useProgramStore } from "@/store/resource/program";
import { getRouteParam } from "@/util/router/getRouteParam";
import { NotificationSeverity } from "@esposter/db-schema";
import { downloadFile, getResultAsync } from "@esposter/shared";

// The status blade's participants and the command that generates them, which hands the owner the file of links they send
// From. The invite export reads the same rows, so it is handed them rather than reading them a second time
export const useProgramStatus = () => {
  const { currentRoute } = useRouter();
  const { $trpc } = useNuxtApp();
  const programStore = useProgramStore();
  const { programResource } = storeToRefs(programStore);
  const resourceStore = useResourceStore();
  const { resource } = storeToRefs(resourceStore);
  const notificationStore = useNotificationStore();
  const { createErrorNotification, createNotification, createWarningNotification } = notificationStore;
  const { executeMutation, isPending: isGeneratePending } = useMutation();
  const id = computed(() => getRouteParam(currentRoute.value.params, "id"));
  const statusRows = ref<ProgramStatusRow[]>([]);
  // Set when the response scan hit its cap, which makes every count on this blade a floor rather than a total
  const isRespondedPartial = ref(false);
  const { exportInvites } = useProgramInviteExport(statusRows);
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

  return { exportInvites, generateParticipants, isGeneratePending, isRespondedPartial, readStatus, statusRows };
};
