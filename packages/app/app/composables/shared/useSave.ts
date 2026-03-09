import type { ItemMetadata } from "@esposter/shared";
import type { MaybeRefOrGetter } from "vue";
import type { z } from "zod";

import { authClient } from "@/services/auth/authClient";
import { saveItemMetadata } from "@/services/shared/metadata/saveItemMetadata";
import { useAlertStore } from "@/store/alert";

interface UseSaveAuthOptions<T> {
  save: (value: T) => Promise<unknown>;
}

interface UseSaveOptions<T, TOutput> {
  auth?: UseSaveAuthOptions<T>;
  unauth?: UseSaveUnauthOptions<TOutput>;
}

interface UseSaveUnauthOptions<TOutput> {
  key: string;
  schema: z.ZodType<TOutput>;
}

export const useSave = <T extends ItemMetadata & TOutput, TOutput = unknown>(
  maybeValue: MaybeRefOrGetter<T>,
  { auth, unauth }: UseSaveOptions<T, TOutput>,
) => {
  const session = authClient.useSession();
  const alertStore = useAlertStore();
  const saveToLocalStorage = useSaveToLocalStorage();
  return async (): Promise<boolean> => {
    const value = toValue(maybeValue);
    saveItemMetadata(value);

    if (session.value.data && auth)
      try {
        await auth.save(value);
        return true;
      } catch (error) {
        alertStore.createAlert(error instanceof Error ? error.message : String(error), "error");
        return false;
      }

    if (unauth) return saveToLocalStorage(unauth.key, unauth.schema, value);
    return true;
  };
};
