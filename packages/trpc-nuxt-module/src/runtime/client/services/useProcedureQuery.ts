import type { KeysOf } from "#src/runtime/client/models/KeysOf";
import type { QueryAsyncData } from "#src/runtime/client/models/QueryAsyncData";
import type { UseQueryOptions } from "#src/runtime/client/models/UseQueryOptions";
import type { TRPCResolverDef, TRPCUntypedClient } from "@trpc/client";
import type { AnyTRPCRouter } from "@trpc/server";
import type { MaybeRefOrGetter } from "vue";

import { getProcedureKey } from "#src/runtime/client/services/getProcedureKey";
import { mergeSignals } from "#src/runtime/client/services/mergeSignals";
import { useAsyncData } from "nuxt/app";
import { toValue } from "vue";

export const useProcedureQuery = (
  client: TRPCUntypedClient<AnyTRPCRouter>,
  path: string,
  input: MaybeRefOrGetter<unknown>,
  { queryKey, trpc, watch, ...options }: UseQueryOptions<TRPCResolverDef> = {},
): QueryAsyncData<TRPCResolverDef, unknown, KeysOf<unknown>, undefined> =>
  useAsyncData(
    // A getter, so the key follows the input and a changed input is fetched and cached under its own key rather than
    // Under the one the first input was
    () => queryKey ?? getProcedureKey(path, toValue(input)),
    (_nuxtApp, { signal }) =>
      client.query(path, toValue(input), { ...trpc, signal: mergeSignals(signal, trpc?.signal) }),
    {
      ...options,
      // A fixed key no longer follows the input, so the input is watched in its place
      watch: watch === false ? undefined : queryKey === undefined ? watch : [...(watch ?? []), () => toValue(input)],
    },
  );
