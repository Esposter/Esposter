import type { ResourceInResource } from "@esposter/db-schema";

import { authClient } from "@/services/auth/authClient";
import { createErrorAlert } from "@/services/trpc/createErrorAlert";
import { getResultAsync, noop } from "@esposter/shared";

// The owner's published surveys — the invite-block source for both GrapesJS editors. Only published
// Surveys are listed: a draft survey has no public url for a block to link
export const useReadPublishedSurveys = () => {
  const { readSurveyResources } = useReadSurveys();
  const session = authClient.useSession();
  const publishedSurveys = ref<ResourceInResource[]>([]);

  watchImmediate(
    () => session.value.data,
    async (newSession) => {
      if (!newSession) return;
      await getResultAsync(async () => {
        const { items } = await readSurveyResources();
        publishedSurveys.value = items.filter(({ publication }) => publication);
      }).match(noop, createErrorAlert);
    },
  );

  return { publishedSurveys };
};
