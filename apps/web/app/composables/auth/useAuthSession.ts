import { authClient } from "@/services/auth/authClient";

// The session as server rendering reads it, through a fetch shaped like `useFetch` so the request's cookies reach it
// @TODO: no upstream issue — better-auth's `SessionFetch` is one plain signature, which Nuxt 5's route-typed `useFetch`
// Overloads cannot be related to as a value, so the read is handed a call to it; once its type accepts `useFetch`
// Itself, this passes it again
export const useAuthSession = () => authClient.useSession((url, options) => useFetch(url, options));
