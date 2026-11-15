import { checkIsAnsweredByErrorLink } from "#src/services/trpc/checkIsAnsweredByErrorLink";
import { useAlertStore } from "#src/store/alert";

export const createErrorAlert = (error: Error, message = error.message) => {
  if (checkIsAnsweredByErrorLink(error)) return;

  const alertStore = useAlertStore();
  const { createAlert } = alertStore;
  createAlert(message, "error");
};
