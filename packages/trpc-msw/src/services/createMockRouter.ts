import type { ProcedureRegistration } from "#src/models/ProcedureRegistration";
import type { ProcedureResolverOptions } from "#src/models/ProcedureResolverOptions";
import type { TRPCMswRoot } from "#src/models/TRPCMswRoot";
import type { AnyTRPCRouter, TRPCProcedureType } from "@trpc/server";

import { toResolverOptions } from "#src/services/toResolverOptions";
import { exhaustiveGuard } from "@esposter/shared";
import { TRPCError } from "@trpc/server";

// The parser type tRPC's public `.input()` takes, a Standard Schema, a Zod-like object or a plain function
type InputParser = Parameters<TRPCMswRoot<object>["procedure"]["input"]>[0];

// Each mock procedure chains the real procedure's inputs onto the consumer's own builder, so tRPC parses the input with
// The same parsers, in the same order, and answers a rejection with the same BAD_REQUEST the server does
// A tRPC router record's keys are joined into procedure paths, so a dotted key is the nested path it spells
export const createMockRouter = <TContext extends object>(
  { procedure: baseProcedure, router }: TRPCMswRoot<TContext>,
  procedureTypes: ReadonlyMap<string, TRPCProcedureType>,
  registrations: ReadonlyMap<string, ProcedureRegistration>,
  inputRouter?: AnyTRPCRouter,
): AnyTRPCRouter =>
  router(
    Object.fromEntries(
      procedureTypes.entries().map(([path, type]) => {
        const inputs: InputParser[] = inputRouter?._def.procedures[path]?._def.inputs ?? [];
        const procedure = inputs.reduce<typeof baseProcedure>((builder, input) => builder.input(input), baseProcedure);
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
