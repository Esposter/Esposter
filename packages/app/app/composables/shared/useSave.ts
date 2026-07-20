import type { ItemMetadata } from "@esposter/shared";
import type { Resolver, TRPCResolverDef } from "@trpc/client";
import type { z } from "zod";

import { authClient } from "@/services/auth/authClient";
import { saveItemMetadata } from "@/services/shared/metadata/saveItemMetadata";
import { ItemMetadataPropertyNames } from "@esposter/shared";

interface UseSaveAuthOptions<TDef extends TRPCResolverDef> {
  save: Resolver<TDef>;
}

interface UseSaveOptions<TState extends ItemMetadata, T extends ItemMetadata, TDef extends TRPCResolverDef> {
  auth?: UseSaveAuthOptions<TDef>;
  toSave?: (state: TState) => NoInfer<T>;
  unauth?: UseSaveUnauthOptions<T>;
}

interface UseSaveUnauthOptions<T extends ItemMetadata> {
  key: string;
  schema: z.ZodType<T>;
}

// `updatedAt` is bumped by saving itself (`saveItemMetadata`) so it never participates in the dirty check
const getSnapshotJson = (value: ItemMetadata) =>
  JSON.stringify(value, (key, propertyValue: unknown) =>
    key === ItemMetadataPropertyNames.updatedAt ? undefined : propertyValue,
  );

export const useSave = <TState extends ItemMetadata, TDef extends TRPCResolverDef, T extends ItemMetadata = TState>(
  state: Ref<TState>,
  { auth, toSave, unauth }: UseSaveOptions<TState, T, TDef>,
) => {
  const session = authClient.useSession();
  const { executeMutation: executeSaveMutation } = useMutation();
  const saveToLocalStorage = useSaveToLocalStorage();
  // T defaults to TState when toSave is omitted, which TypeScript cannot follow — the single `as never` is the centralized cost
  const getSaveValue = (): T => (toSave ? toSave(state.value) : (state.value as never));
  // Snapshot of the last persisted state — save() skips the API call/localStorage write when nothing changed
  let lastSavedJson = getSnapshotJson(getSaveValue());
  const save = async (): Promise<boolean> => {
    const value = getSaveValue();
    const valueJson = getSnapshotJson(value);
    if (valueJson === lastSavedJson) return true;

    saveItemMetadata(value);
    let isSuccessful = false;
    if (session.value.data && auth)
      await executeSaveMutation(() => auth.save(value), {
        // This composable persists a single state, so its saves supersede one another under a stable key
        key: "save",
        onSuccess: () => {
          isSuccessful = true;
        },
      });
    else if (unauth) isSuccessful = saveToLocalStorage(unauth.key, unauth.schema, value);

    if (isSuccessful) lastSavedJson = valueJson;
    return isSuccessful;
  };
  // Loading a persisted state must go through here so the snapshot resets — load-triggered watches/autosave ticks then skip
  const setState = (newState: TState) => {
    state.value = newState;
    lastSavedJson = getSnapshotJson(getSaveValue());
  };
  return { save, setState };
};
