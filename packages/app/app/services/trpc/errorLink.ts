import type { TRPCRouter } from "@@/server/trpc/routers";
import type { TRPCLink } from "@trpc/client";

import { getSynchronizedFunction } from "#shared/util/function/getSynchronizedFunction";
import { useAlertStore } from "@/store/alert";
import { RoutePath } from "@esposter/shared";
import { TRPCClientError } from "@trpc/client";
import { observable } from "@trpc/server/observable";

// The codes this link puts in front of the user itself. A caller that catches the same rejection and alerts
// `error.message` again shows the user two identical toasts for one failure, so it asks first — the link is the
// Owner for these, and the caller stays the owner for everything it alone can see (a blob PUT, a local guard)
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
          // A background operation neither speaks to the user nor moves them: the hourly read-SAS sweep runs for
          // Whatever room is open, which may be one the user was just removed from, and treating its FORBIDDEN as
          // The user's own throws a still-authenticated user out to the login screen over a timer they never
          // Triggered. Its caller cannot prevent that by swallowing — this runs inside the link chain, before the
          // Rejection reaches it
          if (!err.data || op.context.isBackground) return;

          switch (err.data.code) {
            case "BAD_REQUEST":
            case "TOO_MANY_REQUESTS":
            case "UNPROCESSABLE_CONTENT": {
              const alertStore = useAlertStore();
              const { createAlert } = alertStore;
              createAlert(err.message, "error");
              break;
            }
            case "FORBIDDEN":
            case "UNAUTHORIZED":
              await navigateTo(RoutePath.Login);
              break;
            default:
              break;
          }
        }),
        next: observer.next,
      });
      return unsubscribe;
    });
