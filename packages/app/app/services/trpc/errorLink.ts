import type { TRPCRouter } from "@@/server/trpc/routers";
import type { TRPCLink } from "@trpc/client";

import { getSynchronizedFunction } from "#shared/util/function/getSynchronizedFunction";
import { authClient } from "@/services/auth/authClient";
import { useAlertStore } from "@/store/alert";
import { RoutePath } from "@esposter/shared";
import { TRPCClientError } from "@trpc/client";
import { observable } from "@trpc/server/observable";

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

          if (ALERTED_ERROR_CODES.has(err.data.code)) {
            const alertStore = useAlertStore();
            const { createAlert } = alertStore;
            createAlert(err.message, "error");
          } else if ((err.data.code === "FORBIDDEN" || err.data.code === "UNAUTHORIZED") && !op.context.isBackground) {
            // A scope the link stops, because better-auth's `useSession` unsubscribes through
            // `onScopeDispose` and nothing else here would ever reach it
            const scope = effectScope(true);
            const session = scope.run(() => authClient.useSession());
            // A request still in flight is not an absent session — the ref is null while pending, so a pending
            // Session suppresses the redirect for this invocation rather than throwing an authenticated user out
            const isLoggedOut = Boolean(session && !session.value.isPending && !session.value.data);
            scope.stop();
            if (isLoggedOut) await navigateTo(RoutePath.Login);
          }
        }),
        next: observer.next,
      });
      return unsubscribe;
    });
