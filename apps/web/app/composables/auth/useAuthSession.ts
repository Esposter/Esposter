import { authClient } from "#src/services/auth/authClient";

// The session as server rendering reads it, through `useFetch` so the request's cookies reach it
export const useAuthSession = () => authClient.useSession(useFetch);
