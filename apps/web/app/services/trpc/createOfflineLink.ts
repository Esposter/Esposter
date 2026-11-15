import type { TRPCRouter } from "#server/trpc/routers/index";
import type { TRPCLink } from "@trpc/client";

import { TRPCOfflineClientError } from "#src/models/trpc/TRPCOfflineClientError";
import { observable } from "@trpc/server/observable";

export const createOfflineLink =
  (online: Ref<boolean>): TRPCLink<TRPCRouter> =>
  () =>
  ({ next, op }) =>
    observable((observer) => {
      if (!online.value && op.type !== "subscription") {
        observer.error(new TRPCOfflineClientError());
        return undefined;
      } else return next(op).subscribe(observer);
    });
