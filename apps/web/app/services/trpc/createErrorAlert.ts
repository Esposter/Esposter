import { checkIsAlertedByErrorLink } from "@/services/trpc/checkIsAlertedByErrorLink";
import { useAlertStore } from "@/store/alert";

export const createErrorAlert = (error: Error) => {
  if (checkIsAlertedByErrorLink(error)) return;

  const alertStore = useAlertStore();
  const { createAlert } = alertStore;
  createAlert(error.message, "error");
};
