import { checkIsAlertedByErrorLink } from "@/services/trpc/errorLink";
import { useAlertStore } from "@/store/alert";

// How a caller puts a rejection in front of the user. It defers rather than alerting outright: the error link
// Already shows the codes it owns, so a caller that alerted unconditionally would stack two identical toasts on
// One failure — and the ownership is unconditional, so asking is the only way to know. Everything a caller alone
// Can see (a blob PUT, a local guard) reaches here as an error the link never saw and is shown.
export const createErrorAlert = (error: Error) => {
  if (checkIsAlertedByErrorLink(error)) return;

  const alertStore = useAlertStore();
  const { createAlert } = alertStore;
  createAlert(error.message, "error");
};
