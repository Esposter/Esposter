import type { ProgramInvites } from "#shared/models/resource/program/ProgramInvites";
import type { ProgramStatusRow } from "#shared/models/resource/program/ProgramStatusRow";

import { ProgramInviteScope } from "#shared/models/resource/program/ProgramInviteScope";
import { pluralize } from "#shared/util/text/pluralize";
import { exportPersonalizedHtml } from "@/services/emailEditor/exportPersonalizedHtml";
import { createProgramInviteFiles } from "@/services/resource/program/createProgramInviteFiles";
import { getMissingProgramInviteBindings } from "@/services/resource/program/getMissingProgramInviteBindings";
import { getProgramInviteFilename } from "@/services/resource/program/getProgramInviteFilename";
import { useNotificationStore } from "@/store/notification";
import { useResourceStore } from "@/store/resource";
import { useProgramStore } from "@/store/resource/program";
import { getRouteParam } from "@/util/router/getRouteParam";
import { NotificationSeverity, ResourceType } from "@esposter/db-schema";
import { getResultAsync, RoutePath } from "@esposter/shared";

// The owner's invite export, the invites for everyone or the reminders for those still awaiting. It hands over a file of
// Personalised emails and reports back as notices, and the rows it checks against are the status blade's own
export const useProgramInviteExport = (statusRows: Ref<ProgramStatusRow[]>) => {
  const { currentRoute } = useRouter();
  const { $trpc } = useNuxtApp();
  const programStore = useProgramStore();
  const { programResource } = storeToRefs(programStore);
  const resourceStore = useResourceStore();
  const { resource } = storeToRefs(resourceStore);
  const notificationStore = useNotificationStore();
  const { createErrorNotification, createNotification, createWarningNotification } = notificationStore;
  const id = computed(() => getRouteParam(currentRoute.value.params, "id"));
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
    const { surveyId } = programResource.value;
    const surveyPath = RoutePath.View(ResourceType.Survey, surveyId);
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
      (programInvites) => exportInviteFiles(scope, programInvites),
      createErrorNotification,
    );
  };

  return { exportInvites };
};
