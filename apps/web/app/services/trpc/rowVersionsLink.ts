import type { TRPCRouter } from "#server/trpc/routers/index";
import type { TRPCLink } from "@trpc/client";

import { readRowVersionsHeader } from "#shared/services/realtime/readRowVersionsHeader";
import { readActiveRowVersions } from "#src/services/realtime/collectRowVersions";
import { observable } from "@trpc/server/observable";

// Hands a mutation's changed rows, which its answer's response header names, to the mutation that made the call. The
// Collector is only set while a call is being made, so the link takes it as the call starts, as the topics link does
export const rowVersionsLink: TRPCLink<TRPCRouter> =
  () =>
  ({ next, op }) => {
    const rowVersions = op.type === "mutation" ? readActiveRowVersions() : undefined;
    if (!rowVersions) return next(op);

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
          if (response instanceof Response) rowVersions.push(...readRowVersionsHeader(response.headers, op.path));
          observer.next(value);
        },
      }),
    );
  };
