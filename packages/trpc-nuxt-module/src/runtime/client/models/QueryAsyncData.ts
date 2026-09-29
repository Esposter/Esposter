import type { KeysOf } from "#src/runtime/client/models/KeysOf";
import type { PickFrom } from "#src/runtime/client/models/PickFrom";
import type { QueryError } from "#src/runtime/client/models/QueryError";
import type { TRPCResolverDef } from "@trpc/client";
import type { AsyncData } from "nuxt/app";

export type QueryAsyncData<
  TDefinition extends TRPCResolverDef,
  TData,
  TPickKeys extends KeysOf<TData>,
  TDefault,
> = AsyncData<PickFrom<TData, TPickKeys> | TDefault, QueryError<TDefinition> | undefined>;
