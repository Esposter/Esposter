import type { TRPCRouter } from "@@/server/trpc/routers";
import type { TRPCLink } from "@trpc/client";

import { RoutePath } from "#shared/models/router/RoutePath";
import { getSynchronizedFunction } from "#shared/util/getSynchronizedFunction";
import { observable } from "@trpc/server/observable";
import { toast } from "vuetify-sonner";

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
              toast(err.message, { cardProps: { color: "error" } });
              break;
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
