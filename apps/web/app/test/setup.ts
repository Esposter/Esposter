import type { useSessionData } from "#src/composables/auth/useSessionData";

import { vi } from "vitest";

// The client's twin of `shared/test/setup.ts`, which may not reach the app tree. The browser's better-auth client is
// Registered once, as the server's session is there: its session store outlives the component that asked for it, since
// Nanostores runs the store's cleanup on a timer after the last listener leaves, so a suite that mounts a component
// Reading the session without mocking it lets the real store's cleanup fire after the environment is torn down, where
// `window` no longer has `removeEventListener`
vi.mock(import("#src/services/auth/authClient"), () => import("#src/services/auth/authClient.test"));
// `useSessionData` reads the Nuxt payload, which a suite has no app to hold, so it reads the mocked client's session in
// Its place: every suite signs a user in the one way, through `useSession` (`setupSession`)
vi.mock(import("#src/composables/auth/useSessionData"), async () => {
  const { useSession } = await import("#src/services/auth/authClient.test");
  return {
    useSessionData: () =>
      computed(() => {
        /* oxlint-disable-next-line typescript/no-unsafe-type-assertion -- the mock answers `unknown` on purpose
           (`authClient.test.ts`), and the bare call answers the ref a suite hands it */
        const session = useSession() as Ref<{ data: ReturnType<typeof useSessionData>["value"] }>;
        return session.value.data;
      }),
  };
});
