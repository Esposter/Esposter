import type { TRPCRouter } from "@@/server/trpc/routers";
import type { TRPCLink } from "@trpc/client";
import type { Ref } from "vue";

import { TRPCOfflineClientError } from "@/models/trpc/TRPCOfflineClientError";
import { observable } from "@trpc/server/observable";

export const createOfflineLink =
  (online: Ref<boolean>): TRPCLink<TRPCRouter> =>
  () =>
  ({ next, op }) =>
    observable((observer) => {
      if (!online.value && op.type !== "subscription") {
        observer.error(new TRPCOfflineClientError());
        return;
      }
      return next(op).subscribe(observer);
    });
