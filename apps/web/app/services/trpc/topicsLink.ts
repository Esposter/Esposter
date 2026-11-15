import type { TRPCRouter } from "#server/trpc/routers/index";
import type { TRPCLink } from "@trpc/client";

import { readTopicsHeader } from "#shared/services/realtime/readTopicsHeader";
import { readActiveTopics } from "#src/services/realtime/collectTopics";
import { observable } from "@trpc/server/observable";

// Hands a query's topics, which its answer's response header names, to the read that made the call. First in the
// Chain, since the read's collector is only set while the call is being made
export const topicsLink: TRPCLink<TRPCRouter> =
  () =>
  ({ next, op }) => {
    const topics = op.type === "query" ? readActiveTopics() : undefined;
    if (!topics) return next(op);

    return observable((observer) =>
      next(op).subscribe({
        complete: () => {
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        },
        next: (value) => {
          const response = value.context?.response;
          if (response instanceof Response) topics.push(...readTopicsHeader(response.headers, op.path));
          observer.next(value);
        },
      }),
    );
  };
