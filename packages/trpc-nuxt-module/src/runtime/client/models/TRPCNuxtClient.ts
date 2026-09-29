import type { DecoratedRouterRecord } from "#src/runtime/client/models/DecoratedRouterRecord";
import type { AnyTRPCRouter } from "@trpc/server";

export type TRPCNuxtClient<TRouter extends AnyTRPCRouter> = DecoratedRouterRecord<
  TRouter["_def"]["_config"]["$types"],
  TRouter["_def"]["record"]
>;
