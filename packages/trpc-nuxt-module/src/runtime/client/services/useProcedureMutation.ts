import type { KeysOf } from "#src/runtime/client/models/KeysOf";
import type { UseMutationOptions } from "#src/runtime/client/models/UseMutationOptions";
import type { UseMutationReturn } from "#src/runtime/client/models/UseMutationReturn";
import type { TRPCResolverDef, TRPCUntypedClient } from "@trpc/client";
import type { AnyTRPCRouter } from "@trpc/server";

import { getProcedureKey } from "#src/runtime/client/services/getProcedureKey";
import { createError, useAsyncData } from "nuxt/app";

export const useProcedureMutation = (
  client: TRPCUntypedClient<AnyTRPCRouter>,
  path: string,
  { mutationKey = getProcedureKey(path), trpc, ...options }: UseMutationOptions<TRPCResolverDef> = {},
): UseMutationReturn<TRPCResolverDef, unknown, KeysOf<unknown>, undefined> => {
  // The request the entry's next `execute` settles with, set by `mutate` just before it runs one
  let request: Promise<unknown> = Promise.resolve();
  const asyncData = useAsyncData(mutationKey, () => request, { ...options, immediate: false, server: false });
  // Assigned onto the `AsyncData` itself, which is also its promise, so the return stays awaitable
  return Object.assign(asyncData, {
    mutate: async (input: unknown) => {
      // The call's own request, which it resolves with. The entry cancels an earlier call's fetch when a later call runs,
      // and holds the later call's data, so reading the entry would hand the earlier call the later result. The request
      // takes the caller's signal and the timeout, never the entry's signal, which is the one a cancellation aborts
      const signals = [trpc?.signal, options.timeout === undefined ? undefined : AbortSignal.timeout(options.timeout)];
      const ownRequest = client.mutation(path, input, {
        ...trpc,
        signal: AbortSignal.any(signals.filter((signal): signal is AbortSignal => signal !== undefined)),
      });
      request = ownRequest;
      await asyncData.execute();
      // A failure rejects with the error the entry wraps it in, as a caller has always been rejected with
      const [outcome] = await Promise.allSettled([ownRequest]);
      if (outcome.status === "rejected") throw createError(outcome.reason);
      return outcome.value;
    },
  });
};
