import type { serverFetch } from "nitro/app";

// The Nitro app's in-process fetch, which a server-rendered tRPC call falls back to when its request event has no app
export type TrpcServerFetch = typeof serverFetch;
