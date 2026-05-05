import type { ItemMetadata } from "@esposter/shared";
import type { Resolver, TRPCResolverDef } from "@trpc/client";
import type { z } from "zod";

import { getResultAsync } from "@esposter/shared";
import { authClient } from "@/services/auth/authClient";
import { saveItemMetadata } from "@/services/shared/metadata/saveItemMetadata";
import { useAlertStore } from "@/store/alert";

interface UseSaveAuthOptions<TDef extends TRPCResolverDef> {
  save: Resolver<TDef>;
}

interface UseSaveOptions<T extends ItemMetadata, TDef extends TRPCResolverDef> {
  auth?: UseSaveAuthOptions<TDef>;
  unauth?: UseSaveUnauthOptions<T>;
}

interface UseSaveUnauthOptions<T extends ItemMetadata> {
  key: string;
  schema: z.ZodType<T>;
}

export const useSave = <T extends ItemMetadata, TDef extends TRPCResolverDef>(
  maybeValue: NoInfer<MaybeRefOrGetter<T>>,
  { auth, unauth }: UseSaveOptions<T, TDef>,
) => {
  const session = authClient.useSession();
  const alertStore = useAlertStore();
  const saveToLocalStorage = useSaveToLocalStorage();
  return (): Promise<boolean> => {
    const value = toValue(maybeValue);
    saveItemMetadata(value);

    if (session.value.data && auth)
      return getResultAsync(() => auth.save(value)).match(
        () => true,
        (error) => {
          alertStore.createAlert(error.message, "error");
          return false;
        },
      );

    if (unauth) return Promise.resolve(saveToLocalStorage(unauth.key, unauth.schema, value));
    return Promise.resolve(false);
  };
};
