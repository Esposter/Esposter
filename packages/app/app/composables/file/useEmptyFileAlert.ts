import { EMPTY_FILE_MESSAGE } from "@/services/file/constants";
import { useAlertStore } from "@/store/alert";

export const useEmptyFileAlert = () => {
  const alertStore = useAlertStore();
  const { createAlert } = alertStore;
  createAlert(EMPTY_FILE_MESSAGE, "error");
};
