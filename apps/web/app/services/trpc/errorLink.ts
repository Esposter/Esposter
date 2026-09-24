import type { TRPCRouter } from "@@/server/trpc/routers";
import type { TRPCLink } from "@trpc/client";

import { getSynchronizedFunction } from "#shared/util/function/getSynchronizedFunction";
import { authClient } from "@/services/auth/authClient";
import { ALERTED_ERROR_CODES } from "@/services/trpc/constants";
import { useAlertStore } from "@/store/alert";
import { RoutePath } from "@esposter/shared";
import { observable } from "@trpc/server/observable";

export const errorLink: TRPCLink<TRPCRouter> =
  () =>
  ({ next, op }) =>
    observable((observer) => {
      const unsubscribe = next(op).subscribe({
        complete: () => {
          observer.complete();
        },
        error: getSynchronizedFunction(async (error) => {
          observer.error(error);
          if (!error.data) return;

          if (ALERTED_ERROR_CODES.has(error.data.code)) {
            const alertStore = useAlertStore();
            const { createAlert } = alertStore;
            createAlert(error.message, "error");
          } else if (["FORBIDDEN", "UNAUTHORIZED"].includes(error.data.code) && !op.context.isBackground) {
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
        next: (value) => {
          observer.next(value);
        },
      });
      return unsubscribe;
    });
