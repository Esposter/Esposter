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
      // The call's own request, which it resolves with.
      // The entry cancels an earlier call's fetch when a later call runs, and holds the later call's data.
      // Reading the entry would hand the earlier call the later result.
      // The request takes the caller's signal and the timeout.
      // It never takes the entry's signal, which is the one a cancellation aborts.
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
      // The entry applies `transform` and `pick` to the data it holds, which this call's result never reaches.
      // So this call shapes its result here, as the entry would have shaped it.
      const transformed = options.transform ? await options.transform(outcome.value) : outcome.value;
      if (!options.pick) return transformed;
      const picked: Record<string, unknown> = {};
      // The keys `pick` names are the transformed result's own, which its `unknown` type does not say.
      // The result's shape is the procedure's, which `unknown` does not carry.
      // A key the result lacks reads as undefined, as the entry reads it.
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- the keys are the result's own
      for (const key of options.pick) picked[key] = (transformed as Record<string, unknown>)[key];
      return picked;
    },
  });
};
