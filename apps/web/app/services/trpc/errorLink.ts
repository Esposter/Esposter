import type { TRPCRouter } from "@@/server/trpc/routers";
import type { TRPCLink } from "@trpc/client";

import { getSynchronizedFunction } from "#shared/util/function/getSynchronizedFunction";
import { authClient } from "@/services/auth/authClient";
import { ALERTED_ERROR_CODES } from "@/services/trpc/constants";
import { useAlertStore } from "@/store/alert";
import { getResultAsync, RoutePath } from "@esposter/shared";
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
            // Both codes also refuse a signed-in caller what it may not do, so only a caller the server finds no session
            // For is sent to login. The server is asked rather than the client's session store, which reads pending on
            // A fresh subscription and still signed in once the session has expired on the server
            await getResultAsync(() => authClient.getSession()).match(async ({ data, error: sessionError }) => {
              if (!data && !sessionError) await navigateTo(RoutePath.Login);
            }, console.error);
          }
        }),
        next: (value) => {
          observer.next(value);
        },
      });
      return unsubscribe;
    });
