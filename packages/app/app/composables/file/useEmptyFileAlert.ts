import { useAlertStore } from "@/store/alert";

export const useEmptyFileAlert = () => {
  const alertStore = useAlertStore();
  const { createAlert } = alertStore;
  createAlert(`You can only upload non-empty files!`, "error");
};
