import type { serverFetch as baseServerFetch } from "nitro/app";

// The Nitro app's in-process fetch, for a server-rendered tRPC call whose request event has no app to answer it. The
// Client build replaces `import.meta.server` with false, so the import below is removed there and the client bundle never
// Loads the Nitro app
export const useTrpcServerFetch = (): typeof baseServerFetch => async (resource, init, context) => {
  if (!import.meta.server) throw new TypeError("The in-process tRPC fetch exists on the server only");
  // oxlint-disable-next-line selector-ban/no-restricted-syntax -- a lazy-loader contract: a static import would pull Nitro's app into the client graph
  const { serverFetch } = await import("nitro/app");
  return serverFetch(resource, init, context);
};
