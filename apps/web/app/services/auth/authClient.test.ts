import type { authClient as baseAuthClient } from "#src/services/auth/authClient";

import { describe, vi } from "vitest";

// `authClient` is a better-auth dynamic-path Proxy, so its methods are not configurable own properties and cannot be
// Spied on — the module seam is the only one. The methods a suite drives are typed loosely on purpose:
// `useSession` answers two call forms with two shapes (the nuxt `{ data }` pair for a fetcher, the ref otherwise),
// And what a suite hands back is read by the code under test rather than checked against better-auth's own types.
// The cast is what standing in for the Proxy's full surface costs, and this is the one place it is paid
export const getSession = vi.fn<() => Promise<unknown>>(() => Promise.resolve({ data: null, error: null }));
export const signOut = vi.fn<() => Promise<void>>();
// A suite that never names a session reads a signed-out one, in the shape of the call it made
export const useSession = vi.fn<(fetcher?: unknown) => unknown>((fetcher) =>
  fetcher === undefined ? ref({ data: null }) : { data: ref<null>(null) },
);
export const apiKeyList = vi.fn<() => Promise<unknown>>();
export const listAccounts = vi.fn<() => Promise<unknown>>();
export const updateUser = vi.fn<(input: unknown) => Promise<unknown>>();
export const authClient = {
  apiKey: { list: apiKeyList },
  getSession,
  listAccounts,
  signOut,
  updateUser,
  useSession,
} as unknown as typeof baseAuthClient;

describe.todo("authClient");
