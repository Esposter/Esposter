import type { Resource } from "@esposter/db-schema";

import { authClient } from "@/services/auth/authClient";
import { useAlertStore } from "@/store/alert";
import { getResultAsync, MAX_READ_LIMIT, noop } from "@esposter/shared";

// The owner's published surveys — the invite-block source for both GrapesJS editors. Only published
// Surveys are listed: a draft survey has no public url for a block to link
export const useReadPublishedSurveys = () => {
  const { $trpc } = useNuxtApp();
  const session = authClient.useSession();
  const alertStore = useAlertStore();
  const { createAlert } = alertStore;
  const publishedSurveys = ref<Resource[]>([]);

  watchImmediate(
    () => session.value.data,
    async (newSession) => {
      if (!newSession) return;
      await getResultAsync(async () => {
        const { items } = await $trpc.survey.readResources.query({ limit: MAX_READ_LIMIT });
        publishedSurveys.value = items.filter(({ publication }) => publication);
      }).match(noop, (error) => {
        createAlert(error.message, "error");
      });
    },
  );

  return { publishedSurveys };
};
