import type { ProcedureRegistration } from "#src/models/ProcedureRegistration";
import type { ProcedureResolverOptions } from "#src/models/ProcedureResolverOptions";
import type { TRPCMswRoot } from "#src/models/TRPCMswRoot";
import type { AnyTRPCRouter, TRPCProcedureType } from "@trpc/server";

import { toResolverOptions } from "#src/services/toResolverOptions";
import { exhaustiveGuard } from "@esposter/shared";
import { TRPCError } from "@trpc/server";

// Each procedure reads its resolver when it is called rather than when the router is built, so a resolver a test
// Replaces answers the next call even on a WebSocket connection whose router was built before it. tRPC joins
// A router record's keys into procedure paths, so a dotted key is the nested path it spells
export const createMockRouter = <TContext extends object>(
  { procedure: baseProcedure, router }: TRPCMswRoot<TContext>,
  procedureTypes: ReadonlyMap<string, TRPCProcedureType>,
  registrations: ReadonlyMap<string, ProcedureRegistration>,
): AnyTRPCRouter =>
  router(
    Object.fromEntries(
      procedureTypes.entries().map(([path, type]) => {
        // No schema to parse with, so the input reaches the resolver as the transformer decoded it
        const procedure = baseProcedure.input((value) => value);
        const createNotFoundError = () =>
          new TRPCError({ code: "NOT_FOUND", message: `No "${type}"-procedure on path "${path}"` });

        switch (type) {
          case "mutation":
          case "query":
            return [
              path,
              procedure[type]((options: ProcedureResolverOptions<unknown, unknown>) => {
                const registration = registrations.get(path);
                if (registration?.type !== type) throw createNotFoundError();
                return registration.resolver(toResolverOptions(options));
              }),
            ];
          case "subscription":
            return [
              path,
              procedure.subscription(async function* (options: ProcedureResolverOptions<unknown, unknown>) {
                const registration = registrations.get(path);
                if (registration?.type !== type) throw createNotFoundError();
                yield* await registration.resolver(toResolverOptions(options));
              }),
            ];
          default:
            return exhaustiveGuard(type);
        }
      }),
    ),
  );
