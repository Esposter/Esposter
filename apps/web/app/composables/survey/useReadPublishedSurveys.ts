import type { ResourceInResource } from "@esposter/db-schema";

import { authClient } from "@/services/auth/authClient";
import { createErrorAlert } from "@/services/trpc/createErrorAlert";
import { getResultAsync, noop } from "@esposter/shared";

// The owner's published surveys — the invite-block source for the email editor's GrapesJS blocks. Only published
// Surveys are listed: a draft survey has no public url for a block to link
export const useReadPublishedSurveys = () => {
  const { readSurveyResources } = useReadSurveys();
  const session = authClient.useSession();
  const publishedSurveys = ref<ResourceInResource[]>([]);
  const readPublishedSurveys = () =>
    getResultAsync(async () => {
      const { items } = await readSurveyResources();
      publishedSurveys.value = items.filter(({ publication }) => publication);
    }).match(noop, createErrorAlert);

  watchImmediate(
    () => session.value.data,
    async (newSession) => {
      if (!newSession) return;
      await readPublishedSurveys();
    },
  );
  // Coming back to the window re-reads the list, so a survey published or unpublished in another tab reaches the
  // Invite blocks without the owner reopening the editor. Signed out, there is nothing to read
  useEventListener(
    () => window,
    "focus",
    () => session.value.data && readPublishedSurveys(),
  );

  return { publishedSurveys };
};
