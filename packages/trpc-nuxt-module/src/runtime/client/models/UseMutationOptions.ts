import type { KeysOf } from "#src/runtime/client/models/KeysOf";
import type { TRPCRequestOptions, TRPCResolverDef } from "@trpc/client";
import type { AsyncDataOptions } from "nuxt/app";
import type { Except } from "type-fest";

// A mutation runs only when `mutate` is called, in the browser, so the options deciding when and where a query runs
// Are not offered
export type UseMutationOptions<
  TDefinition extends TRPCResolverDef,
  TData = TDefinition["output"],
  TPickKeys extends KeysOf<TData> = KeysOf<TData>,
  TDefault = undefined,
> = Except<
  AsyncDataOptions<TDefinition["output"], TData, TPickKeys, TDefault>,
  "enabled" | "immediate" | "lazy" | "server" | "watch"
> & { mutationKey?: string; trpc?: TRPCRequestOptions };
