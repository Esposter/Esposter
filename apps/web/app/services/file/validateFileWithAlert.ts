import { validateFile } from "@/services/file/validateFile";
import { useAlertStore } from "@/store/alert";

// Wraps the client-side file validator so every rejection surfaces the same error alert, naming the file it
// Rejected — a multi-file drop is rejected as a whole, so the alert has to say which file caused it.
// Callers only branch on the boolean.
export const validateFileWithAlert = (file: File, maxSize?: number) => {
  const alertStore = useAlertStore();
  const { createAlert } = alertStore;
  const fileValidation = validateFile(file.size, maxSize);
  if (!fileValidation.isValid) createAlert(`${file.name}: ${fileValidation.message}`, "error");
  return fileValidation.isValid;
};
