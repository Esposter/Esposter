import type { TRPCRouter } from "#server/trpc/routers/index";
import type { Operation, TRPCLink } from "@trpc/client";

import { observable } from "@trpc/server/observable";

// A link that hands what one kind of call's answer names in a response header to the collector active as the
// Call starts. the collector is only set while a call is being made, so the link takes it then, before the answer
// Arrives
export const createResponseHeaderLink =
  <T>(
    type: Operation["type"],
    readActiveCollector: () => T[] | undefined,
    readHeader: (headers: Headers, path: string) => T[],
  ): TRPCLink<TRPCRouter> =>
  () =>
  ({ next, op }) => {
    const collector = op.type === type ? readActiveCollector() : undefined;
    if (!collector) return next(op);

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
          if (response instanceof Response) collector.push(...readHeader(response.headers, op.path));
          observer.next(value);
        },
      }),
    );
  };
