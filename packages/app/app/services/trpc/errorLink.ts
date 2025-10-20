import type { TRPCRouter } from "@@/server/trpc/routers";
import type { TRPCLink } from "@trpc/client";

import { getSynchronizedFunction } from "#shared/util/getSynchronizedFunction";
import { useAlertStore } from "@/store/alert";
import { RoutePath } from "@esposter/shared";
import { observable } from "@trpc/server/observable";

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
            case "FORBIDDEN":
            case "UNAUTHORIZED":
              await navigateTo(RoutePath.Login);
              break;
          }
        }),
        next: observer.next,
      });
      return unsubscribe;
    });
