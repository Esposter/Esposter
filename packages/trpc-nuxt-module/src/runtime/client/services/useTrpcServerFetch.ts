import type { TrpcServerFetch } from "#src/models/TrpcServerFetch";

// The Nitro app's in-process fetch, for a server-rendered tRPC call whose request event has no app to answer it. The
// Client build replaces `import.meta.server` with false, so the import below is removed there and the client bundle never
// Loads the Nitro app
export const useTrpcServerFetch = (): TrpcServerFetch => async (resource, init, context) => {
  if (!import.meta.server) throw new TypeError("The in-process tRPC fetch exists on the server only");
  // eslint-disable-next-line no-restricted-syntax -- a lazy-loader contract: a static import would pull Nitro's app into the client graph
  const { serverFetch } = await import("nitro/app");
  return serverFetch(resource, init, context);
};
