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

export const getIsAlertedByErrorLink = (error: unknown): boolean =>
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

          switch (err.data.code) {
            case "BAD_REQUEST":
            case "TOO_MANY_REQUESTS":
            case "UNPROCESSABLE_CONTENT": {
              const alertStore = useAlertStore();
              const { createAlert } = alertStore;
              createAlert(err.message, "error");
              break;
            }
            // Neither code names the user's session: `UNAUTHORIZED` is thrown by every authorization guard in the
            // Server (not a member, not the owner, lacking a permission) and `FORBIDDEN` by every message-creation
            // Rejection, so inferring "logged out" from either throws a still-authenticated user out to the login
            // Screen for typing a filtered word or opening a room they were just removed from. The session is a
            // Fact the client already holds, so the decision reads it instead of guessing from the code.
            case "FORBIDDEN":
            case "UNAUTHORIZED": {
              // A background operation never moves the user: the hourly read-SAS sweep runs for whatever room is
              // Open, which may be one the user was just removed from, and treating its FORBIDDEN as the user's own
              // Throws a still-authenticated user out to the login screen over a timer they never triggered. Its
              // Caller cannot prevent that by swallowing — this runs inside the link chain, before the rejection
              // Reaches it. It still alerts above, because a failure the user's own action caused is theirs to see
              if (op.context.isBackground) break;

              const session = authClient.useSession();
              // A request still in flight is not an absent session. This runs outside any component or effect
              // Scope, so the nanostore ref it reads is whatever the session fetch has resolved so far — null while
              // Pending, which is every rejection that beats the first session read (a page's first call, or SSR
              // Where the client holds no cookies). Redirecting on that logs an authenticated user out of their own
              // First page load, the exact failure reading the session instead of the code exists to prevent
              if (!session.value.isPending && !session.value.data) await navigateTo(RoutePath.Login);
              break;
            }
            default:
              break;
          }
        }),
        next: observer.next,
      });
      return unsubscribe;
    });
