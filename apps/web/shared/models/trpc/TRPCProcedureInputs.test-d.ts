import type { TRPCRouter } from "#server/trpc/routers";
import type { TRPCPath, TRPCProcedureInputs } from "#shared/models/trpc/TRPCProcedureInputs";
import type { inferRouterInputs } from "@trpc/server";
import type { Get } from "type-fest";

import { describe, expectTypeOf, test } from "vitest";

// The one place allowed to import the router: a type test is outside the runtime graph, and this is what keeps the
// Hand-written leaf honest. Every trigger path's input must be the input the real router gives that procedure
describe("TRPCProcedureInputs", () => {
  test("matches the input of every trigger procedure on the real router", () => {
    expectTypeOf<{ [P in TRPCPath]: Get<inferRouterInputs<TRPCRouter>, P> }>().toEqualTypeOf<TRPCProcedureInputs>();
  });
});
