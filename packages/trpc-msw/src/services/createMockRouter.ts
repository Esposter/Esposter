import type { ProcedureRegistration } from "#src/models/ProcedureRegistration";
import type { ProcedureResolverOptions } from "#src/models/ProcedureResolverOptions";
import type { TRPCMswRoot } from "#src/models/TRPCMswRoot";
import type { AnyTRPCRouter, TRPCProcedureType } from "@trpc/server";
import type { ParseFn, Parser } from "@trpc/server/unstable-core-do-not-import";

import { toResolverOptions } from "#src/services/toResolverOptions";
import { exhaustiveGuard } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { getParseFn } from "@trpc/server/unstable-core-do-not-import";

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
        // The real procedure's parsers, read through tRPC's own `getParseFn`, only judge the input: a rejection is the
        // BAD_REQUEST the server answers with, and the resolver still receives the input as the transformer decoded it
        const parseFns: ParseFn<unknown>[] = (inputRouter?._def.procedures[path]?._def.inputs ?? []).map(
          (parser: Parser) => getParseFn(parser),
        );
        const procedure = baseProcedure.input(async (value) => {
          // oxlint-disable-next-line no-await-in-loop -- Order is the contract: the server's input middlewares run in turn and stop at the first rejection
          for (const parseFn of parseFns) await parseFn(value);
          return value;
        });
        const createNotFoundError = () =>
          new TRPCError({ code: "NOT_FOUND", message: `No "${type}"-procedure on path "${path}"` });

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
