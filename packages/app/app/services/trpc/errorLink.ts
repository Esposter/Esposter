import type { TRPCRouter } from "@@/server/trpc/routers";
import type { TRPCLink } from "@trpc/client";

import { getSynchronizedFunction } from "#shared/util/function/getSynchronizedFunction";
import { authClient } from "@/services/auth/authClient";
import { useAlertStore } from "@/store/alert";
import { RoutePath } from "@esposter/shared";
import { TRPCClientError } from "@trpc/client";
import { observable } from "@trpc/server/observable";

// The codes this link puts in front of the user itself. A caller that catches the same rejection and alerts
// `error.message` again shows the user two identical toasts for one failure, so it asks first — the link is the
// Owner for these, and the caller stays the owner for everything it alone can see (a blob PUT, a local guard).
// Ownership is unconditional: a caller reads this predicate off the code alone, so any operation the link declines
// To alert is an operation nobody alerts — the caller has already been told the link owns it
const ALERTED_ERROR_CODES = new Set(["BAD_REQUEST", "TOO_MANY_REQUESTS", "UNPROCESSABLE_CONTENT"]);

export const checkIsAlertedByErrorLink = (error: unknown): boolean =>
  error instanceof TRPCClientError && ALERTED_ERROR_CODES.has(String(error.data?.code));

export const errorLink: TRPCLink<TRPCRouter> =
  () =>
  ({ next, op }) =>
    observable((observer) => {
      const unsubscribe = next(op).subscribe({
        complete: observer.complete,
        error: getSynchronizedFunction(async (err) => {
          observer.error(err);
          if (!err.data) return;

          // The same set `checkIsAlertedByErrorLink` answers from, so a caller can never be told the link owns a
          // Code the link then declines to alert
          if (ALERTED_ERROR_CODES.has(err.data.code)) {
            const alertStore = useAlertStore();
            const { createAlert } = alertStore;
            createAlert(err.message, "error");
          } else if ((err.data.code === "FORBIDDEN" || err.data.code === "UNAUTHORIZED") && !op.context.isBackground) {
            // Neither code names the user's session: `UNAUTHORIZED` is thrown by every authorization guard in the
            // Server (not a member, not the owner, lacking a permission) and `FORBIDDEN` by every message-creation
            // Rejection, so inferring "logged out" from either throws a still-authenticated user out to the login
            // Screen for typing a filtered word or opening a room they were just removed from. The session is a
            // Fact the client already holds, so the decision reads it instead of guessing from the code.
            //
            // A background operation never moves the user: the hourly read-SAS sweep runs for whatever room is
            // Open, which may be one the user was just removed from, and treating its FORBIDDEN as the user's own
            // Throws a still-authenticated user out to the login screen over a timer they never triggered. Its
            // Caller cannot prevent that by swallowing — this runs inside the link chain, before the rejection
            // Reaches it. It still alerts above, because a failure the user's own action caused is theirs to see
            //
            // Subscribed inside a scope this link owns and then stops. `useStore` registers its unsubscribe
            // Through `onScopeDispose`, which it only reaches when a scope is active — and this runs inside a
            // Promise, where none is. Called bare, every rejection would leave another listener on the
            // Module-singleton session atom: a client whose reads keep rejecting (a room it was removed from)
            // Accumulates one per rejection for the life of the tab, and on the server for the life of the process
            const scope = effectScope(true);
            const session = scope.run(() => authClient.useSession());
            // A request still in flight is not an absent session. The nanostore ref reads whatever the session
            // Fetch has resolved so far — null while pending, which is every rejection that beats the first
            // Session read (a page's first call, or SSR where the client holds no cookies). Redirecting on that
            // Logs an authenticated user out of their own first page load, the exact failure reading the session
            // Instead of the code exists to prevent
            const isLoggedOut = Boolean(session && !session.value.isPending && !session.value.data);
            scope.stop();
            if (isLoggedOut) await navigateTo(RoutePath.Login);
          }
        }),
        next: observer.next,
      });
      return unsubscribe;
    });
