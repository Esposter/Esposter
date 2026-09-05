import { checkIsAlertedByErrorLink } from "@/services/trpc/errorLink";
import { useAlertStore } from "@/store/alert";

export const createErrorAlert = (error: Error) => {
  if (checkIsAlertedByErrorLink(error)) return;

  const alertStore = useAlertStore();
  const { createAlert } = alertStore;
  createAlert(error.message, "error");
};
