import type { KeysOf } from "#src/runtime/client/models/KeysOf";
import type { UseMutationOptions } from "#src/runtime/client/models/UseMutationOptions";
import type { UseMutationReturn } from "#src/runtime/client/models/UseMutationReturn";
import type { TRPCResolverDef, TRPCUntypedClient } from "@trpc/client";
import type { AnyTRPCRouter } from "@trpc/server";

import { getProcedureKey } from "#src/runtime/client/services/getProcedureKey";
import { mergeSignals } from "#src/runtime/client/services/mergeSignals";
import { useAsyncData } from "nuxt/app";

export const useProcedureMutation = (
  client: TRPCUntypedClient<AnyTRPCRouter>,
  path: string,
  { mutationKey = getProcedureKey(path), trpc, ...options }: UseMutationOptions<TRPCResolverDef> = {},
): UseMutationReturn<TRPCResolverDef, unknown, KeysOf<unknown>, undefined> => {
  // What the next `execute` sends, set by `mutate` just before it runs one
  let mutationInput: unknown;
  const asyncData = useAsyncData(
    mutationKey,
    (_nuxtApp, { signal }) =>
      client.mutation(path, mutationInput, { ...trpc, signal: mergeSignals(signal, trpc?.signal) }),
    { ...options, immediate: false, server: false },
  );
  return {
    ...asyncData,
    mutate: async (input) => {
      mutationInput = input;
      await asyncData.execute();
      // `execute` settles either way and leaves a failure in the ref, so a caller awaiting the mutation would
      // Otherwise read a rejection as a success with no data
      if (asyncData.error.value) throw asyncData.error.value;
      return asyncData.data.value;
    },
  };
};
