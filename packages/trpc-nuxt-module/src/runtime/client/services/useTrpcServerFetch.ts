import type { serverFetch as baseServerFetch } from "nitro/app";

// The Nitro app's in-process fetch, for a server-rendered tRPC call whose request event has no app to answer it.
// The client build replaces `import.meta.server` with false, so the import below is removed there.
// The client bundle never loads the Nitro app.
export const useTrpcServerFetch = (): typeof baseServerFetch => async (resource, init, context) => {
  if (!import.meta.server) throw new TypeError("The in-process tRPC fetch exists on the server only");
  // The import is dynamic, since a static one would pull Nitro's app into the client graph.
  // oxlint-disable-next-line selector-ban/no-restricted-syntax -- the dynamic import is the lazy one
  const { serverFetch } = await import("nitro/app");
  return serverFetch(resource, init, context);
};
