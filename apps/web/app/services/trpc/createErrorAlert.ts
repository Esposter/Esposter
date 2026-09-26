import { checkIsAnsweredByErrorLink } from "@/services/trpc/checkIsAnsweredByErrorLink";
import { useAlertStore } from "@/store/alert";

export const createErrorAlert = (error: Error) => {
  if (checkIsAnsweredByErrorLink(error)) return;

  const alertStore = useAlertStore();
  const { createAlert } = alertStore;
  createAlert(error.message, "error");
};
