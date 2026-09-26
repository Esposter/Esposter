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

          const alertStore = useAlertStore();
          const { createAlert } = alertStore;

          if (ALERTED_ERROR_CODES.has(error.data.code)) createAlert(error.message, "error");
          else if (["FORBIDDEN", "UNAUTHORIZED"].includes(error.data.code)) {
            // Both codes also refuse a signed-in caller what it may not do, so only a caller the server finds no session
            // For is sent to login. The server is asked rather than the client's session store, which reads pending on
            // A fresh subscription and still signed in once the session has expired on the server
            const isSignedOut =
              !op.context.isBackground &&
              (await getResultAsync(() => authClient.getSession())
                .orTee(console.error)
                .match(
                  ({ data, error: sessionError }) => !data && !sessionError,
                  () => false,
                ));
            if (isSignedOut) await navigateTo(RoutePath.Login);
            // Callers leave a missing session to the link, so where it sends nobody to login it says so itself
            else if (error.data.code === "UNAUTHORIZED") createAlert(error.message, "error");
          }
        }),
        next: (value) => {
          observer.next(value);
        },
      });
      return unsubscribe;
    });
