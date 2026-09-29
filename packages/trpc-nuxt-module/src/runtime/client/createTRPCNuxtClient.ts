import type { TRPCNuxtClient } from "#src/runtime/client/models/TRPCNuxtClient";
import type { UseMutationOptions } from "#src/runtime/client/models/UseMutationOptions";
import type { UseQueryOptions } from "#src/runtime/client/models/UseQueryOptions";
import type { UseSubscriptionOptions } from "#src/runtime/client/models/UseSubscriptionOptions";
import type { CreateTRPCClientOptions, TRPCRequestOptions, TRPCResolverDef } from "@trpc/client";
import type { AnyTRPCRouter } from "@trpc/server";

import { useProcedureMutation } from "#src/runtime/client/services/useProcedureMutation";
import { useProcedureQuery } from "#src/runtime/client/services/useProcedureQuery";
import { useProcedureSubscription } from "#src/runtime/client/services/useProcedureSubscription";
import { createTRPCUntypedClient } from "@trpc/client";
import { createTRPCRecursiveProxy } from "@trpc/server";

// The vanilla client's calls, decorated with composables over `useAsyncData`. Every node is a proxy: the last segment
// Of a call's path names the method and the segments before it the procedure. The proxy hands its arguments over
// Untyped; `TRPCNuxtClient` is what checked them at the call site
export const createTRPCNuxtClient = <TRouter extends AnyTRPCRouter>(
  options: CreateTRPCClientOptions<TRouter>,
): TRPCNuxtClient<TRouter> => {
  const client = createTRPCUntypedClient(options);
  return createTRPCRecursiveProxy<TRPCNuxtClient<TRouter>>(({ args: [first, second], path }) => {
    const procedurePath = path.slice(0, -1);
    const procedure = procedurePath.join(".");
    switch (path.at(-1)) {
      case "_def":
        return { path: procedurePath };
      case "mutate":
        return client.mutation(procedure, first, second as TRPCRequestOptions | undefined);
      case "query":
        return client.query(procedure, first, second as TRPCRequestOptions | undefined);
      case "subscribe":
        return client.subscription(procedure, first, second as UseSubscriptionOptions<TRPCResolverDef>);
      case "useLazyQuery":
        return useProcedureQuery(client, procedure, first, {
          ...(second as undefined | UseQueryOptions<TRPCResolverDef>),
          lazy: true,
        });
      case "useMutation":
        return useProcedureMutation(client, procedure, first as undefined | UseMutationOptions<TRPCResolverDef>);
      case "useQuery":
        return useProcedureQuery(client, procedure, first, second as undefined | UseQueryOptions<TRPCResolverDef>);
      case "useSubscription":
        return useProcedureSubscription(
          client,
          procedure,
          first,
          second as undefined | UseSubscriptionOptions<TRPCResolverDef>,
        );
      default:
        throw new TypeError(`"${path.join(".")}" is not a procedure call`);
    }
  });
};
