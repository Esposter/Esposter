import { useAlertStore } from "@/store/alert";
import { z } from "zod";

export const useSaveToLocalStorage = () => {
  const alertStore = useAlertStore();
  return <T extends z.ZodType>(key: string, schema: T, value: z.infer<T>): boolean => {
    const result = schema.safeParse(value);
    if (!result.success) {
      alertStore.createAlert(z.prettifyError(result.error), "error");
      return false;
    }
    localStorage.setItem(key, JSON.stringify(result.data));
    return true;
  };
};
