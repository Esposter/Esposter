import type { authClient as baseAuthClient } from "@/services/auth/authClient";

import { describe, vi } from "vitest";

// `authClient` is a better-auth dynamic-path Proxy, so its methods are not configurable own properties and cannot be
// Spied on — the module seam is the only one. The two methods a suite drives are typed loosely on purpose:
// `useSession` answers two call forms with two shapes (the nuxt `{ data }` pair for a fetcher, the ref otherwise),
// And what a suite hands back is read by the code under test rather than checked against better-auth's own types.
// The cast is what standing in for the Proxy's full surface costs, and this is the one place it is paid
export const signOut = vi.fn<() => Promise<void>>();
export const useSession = vi.fn<(fetcher?: unknown) => unknown>();
export const authClient = { signOut, useSession } as unknown as typeof baseAuthClient;

describe.todo("authClient");
