import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import type { CreateWSSContextFnOptions } from "@trpc/server/adapters/ws";

// The two transports hand their context factory different requests, exactly as tRPC's own adapters do
export type CreateContextOptions = CreateWSSContextFnOptions | FetchCreateContextFnOptions;
