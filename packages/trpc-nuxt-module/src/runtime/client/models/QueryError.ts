import type { TRPCClientErrorLike, TRPCResolverDef } from "@trpc/client";
import type { NuxtError } from "nuxt/app";

// `useAsyncData` wraps whatever its handler rejects with in a `NuxtError`, carrying the rejection's `data` over, so a
// Query's error is Nuxt's error around the tRPC error's data rather than the tRPC error itself
export type QueryError<TDefinition extends TRPCResolverDef> = NuxtError<TRPCClientErrorLike<TDefinition>["data"]>;
