import type { ProcedureRegistration } from "#src/models/ProcedureRegistration";
import type { ProcedureResolverOptions } from "#src/models/ProcedureResolverOptions";
import type { TRPCMswRoot } from "#src/models/TRPCMswRoot";
import type { AnyTRPCRouter, TRPCProcedureType } from "@trpc/server";

import { toResolverOptions } from "#src/services/toResolverOptions";
import { exhaustiveGuard } from "@esposter/shared";
import { TRPCError } from "@trpc/server";

// A tRPC input parser as the procedure builder's own `.input()` takes it, a Standard Schema or a plain function
type InputParser<TContext extends object> = Parameters<TRPCMswRoot<TContext>["procedure"]["input"]>[0];

// Each procedure reads its resolver when it is called rather than when the router is built, so a resolver a test
// Replaces answers the next call even on a WebSocket connection whose router was built before it. tRPC joins
// A router record's keys into procedure paths, so a dotted key is the nested path it spells
export const createMockRouter = <TContext extends object>(
  { procedure: baseProcedure, router }: TRPCMswRoot<TContext>,
  procedureTypes: ReadonlyMap<string, TRPCProcedureType>,
  registrations: ReadonlyMap<string, ProcedureRegistration>,
  inputRouter?: AnyTRPCRouter,
): AnyTRPCRouter =>
  router(
    Object.fromEntries(
      procedureTypes.entries().map(([path, type]) => {
        // The real procedure's own `.input()` calls, so tRPC parses the input as the server does: a rejection is the
        // BAD_REQUEST the server answers with, and the resolver gets what the parsers return, combined as tRPC does
        const parsers: InputParser<TContext>[] = inputRouter?._def.procedures[path]?._def.inputs ?? [];
        const procedure = parsers.reduce<TRPCMswRoot<TContext>["procedure"]>(
          (builder, parser) => builder.input(parser) as TRPCMswRoot<TContext>["procedure"],
          baseProcedure,
        );
        const createNotFoundError = () =>
          new TRPCError({ code: "NOT_FOUND", message: `No "${type}"-procedure on path "${path}"` });

        // Each procedure reads its resolver when it is called rather than when the router is built, so a resolver a test
        // Replaces answers the next call even on a WebSocket connection whose router was built before it
        switch (type) {
          case "mutation":
          case "query":
            return [
              path,
              procedure[type]((options: ProcedureResolverOptions<unknown, unknown>) => {
                const registration = registrations.get(path);
                if (registration?.type === type) return registration.resolver(toResolverOptions(options));
                else throw createNotFoundError();
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
