import { authClient } from "@/services/auth/authClient";
import { getResultAsync, noop } from "@esposter/shared";

// Ending a session server-side deletes the row and nothing else: this browser still holds the cookie that named
// It, and Nuxt still holds the session it already fetched, so the app goes on rendering a signed-in account.
// `signOut` is what clears the cookie, and the full load is what drops the fetched session with it — a
// Client-side navigation keeps the payload the signed-in render came from. Reloads in place unless given
// Somewhere to land, because signing out of the page you are on is not the same act as revoking the session
// Holding you there
export const signOutOfBrowser = async (path = "") => {
  // Best-effort, and the load happens either way: by the time a caller reaches here the session is already
  // Gone server-side, so a failed cookie clear must not be what strands the reader on a page still drawn as
  // Signed in — the reload reads the session back as absent regardless
  await getResultAsync(() => authClient.signOut()).match(noop, console.error);
  if (path) window.location.href = path;
  else window.location.reload();
};
