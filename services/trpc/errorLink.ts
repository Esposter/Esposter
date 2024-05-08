import { RoutePath } from "@/models/router/RoutePath";
import type { TrpcRouter } from "@/server/trpc/routers";
import type { TRPCLink } from "@trpc/client";
import { observable } from "@trpc/server/observable";

export const errorLink: TRPCLink<TrpcRouter> =
  () =>
  ({ next, op }) =>
    observable((observer) => {
      const unsubscribe = next(op).subscribe({
        next: observer.next,
        error: (err) => {
          observer.error(err);
          if (err.data && (err.data.code === "UNAUTHORIZED" || err.data.code === "FORBIDDEN"))
            void navigateTo(RoutePath.Login);
        },
        complete: observer.complete,
      });
      return unsubscribe;
    });
