import { useAlertStore } from "#src/store/alert";
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
    // The writer half of the offline save system: the key is a parameter, so there is no ref to own it — see
    // `openspec/specs/architecture/browser-execution/design.md`
    // oxlint-disable-next-line selector-ban/no-restricted-syntax -- see the comment above
    window.localStorage.setItem(key, JSON.stringify(parsedResult.data));
    return true;
  };
};
