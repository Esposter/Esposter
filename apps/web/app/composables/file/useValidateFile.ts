import { validateFile } from "@/services/file/validateFile";
import { useAlertStore } from "@/store/alert";

// Wraps the client-side file validator so every rejection surfaces the same error alert, naming the file it
// Rejected — a multi-file drop is rejected as a whole, so the alert has to say which file caused it.
// Callers only branch on the boolean.
export const useValidateFile = () => {
  const alertStore = useAlertStore();
  const { createAlert } = alertStore;
  return (file: File, maxSize?: number) => {
    const fileValidation = validateFile(file.size, maxSize);
    if (!fileValidation.isValid) createAlert(`${file.name}: ${fileValidation.message}`, "error");
    return fileValidation.isValid;
  };
};
