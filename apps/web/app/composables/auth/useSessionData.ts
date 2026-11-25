import type { authClient } from "#src/services/auth/authClient";

import { AsyncDataKey } from "#src/services/shared/AsyncDataKey";

// The session `useAuthSession` read at the root, read back synchronously for a component that renders many times (a
// Feed's vote pill, a comment tree's node), where the awaited read would make each one an async boundary. It is the
// Payload's entry, so the server's render and the client's first render see the same session, where better-auth's own
// Synchronous `useSession()` starts empty on the server and fills on the client before hydration ends
export const useSessionData = () =>
  useNuxtData<ReturnType<typeof authClient.useSession>["value"]["data"]>(AsyncDataKey.AuthSession).data;
