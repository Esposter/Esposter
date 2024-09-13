import type { TRPCRouter } from "@/server/trpc/routers";
import type { TRPCLink } from "@trpc/client";

import { RoutePath } from "@/models/router/RoutePath";
import { observable } from "@trpc/server/observable";

export const errorLink: TRPCLink<TRPCRouter> =
  () =>
  ({ next, op }) =>
    observable((observer) => {
      const unsubscribe = next(op).subscribe({
        complete: observer.complete,
        error: (err) => {
          observer.error(err);
          if (err.data && (err.data.code === "UNAUTHORIZED" || err.data.code === "FORBIDDEN"))
            void navigateTo(RoutePath.Login);
        },
        next: observer.next,
      });
      return unsubscribe;
    });
