import { authClient } from "#src/services/auth/authClient";
import { AsyncDataKey } from "#src/services/shared/AsyncDataKey";

// The session as server rendering reads it, through `useFetch` so the request's cookies reach it. Its key is ours, so
// `useSessionData` reads the same payload entry back without a request or an async boundary
export const useAuthSession = () =>
  authClient.useSession((url, options) => useFetch(url, { ...options, key: AsyncDataKey.AuthSession }));
