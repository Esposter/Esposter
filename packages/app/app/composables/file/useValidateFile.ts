import type { FileEntity } from "@esposter/db-schema";

import { validateFile } from "@/services/file/validateFile";
import { useAlertStore } from "@/store/alert";

// Wraps the client-side file validator so every rejection surfaces the same error alert —
// Callers only branch on the boolean.
export const useValidateFile = () => {
  const alertStore = useAlertStore();
  const { createAlert } = alertStore;
  return (size: FileEntity["size"], maxSize?: number) => {
    const result = validateFile(size, maxSize);
    if (!result.isValid) createAlert(result.message, "error");
    return result.isValid;
  };
};
