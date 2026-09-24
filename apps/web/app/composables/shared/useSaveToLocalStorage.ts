import { useAlertStore } from "@/store/alert";
import { z } from "zod";

export const useSaveToLocalStorage = () => {
  const alertStore = useAlertStore();
  const { createAlert } = alertStore;
  return <T extends z.ZodType>(key: string, schema: T, value: z.infer<T>) => {
    const parsedResult = schema.safeParse(value);
    if (!parsedResult.success) {
      createAlert(z.prettifyError(parsedResult.error), "error");
      return false;
    }
    // eslint-disable-next-line no-restricted-syntax -- the writer half of the offline save system: the key is a parameter, so there is no ref to own it. Called from a user-driven save, which is client-only — see the browser-boundary ledger
    window.localStorage.setItem(key, JSON.stringify(parsedResult.data));
    return true;
  };
};
