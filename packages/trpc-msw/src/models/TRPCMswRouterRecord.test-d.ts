import type { TRPCMswRouterRecord } from "#src/models/TRPCMswRouterRecord";

import { initTRPC } from "@trpc/server";
import { describe, expect, expectTypeOf, test } from "vitest";
import { z } from "zod";

describe("tRPCMswRouterRecord type", () => {
  const t = initTRPC.context<{ id: string }>().create();
  const router = t.router({
    nested: t.router({ read: t.procedure.input(z.object({ id: z.string() })).query(() => new Date(0)) }),
    // oxlint-disable-next-line require-await -- A subscription is an AsyncIterable, which only an async generator yields
    subscribe: t.procedure.subscription(async function* () {
      yield 0;
    }),
    write: t.procedure.output(z.number()).mutation(() => 0),
  });
  type Record = TRPCMswRouterRecord<{ id: string }, (typeof router)["_def"]["record"]>;

  test("#25 query", () => {
    expect.hasAssertions();

    expectTypeOf<Parameters<Parameters<Record["nested"]["read"]["query"]>[0]>[0]["input"]>().toEqualTypeOf<{
      id: string;
    }>();
    expectTypeOf<ReturnType<Parameters<Record["nested"]["read"]["query"]>[0]>>().toEqualTypeOf<
      Date | PromiseLike<Date>
    >();
  });

  test("#22 mutation with an output parser", () => {
    expect.hasAssertions();

    expectTypeOf<ReturnType<Parameters<Record["write"]["mutation"]>[0]>>().toEqualTypeOf<
      number | PromiseLike<number>
    >();
    expectTypeOf<Record["write"]>().toEqualTypeOf<{ readonly mutation: Record["write"]["mutation"] }>();
  });

  test("#2 context", () => {
    expect.hasAssertions();

    expectTypeOf<Parameters<Parameters<Record["write"]["mutation"]>[0]>[0]["ctx"]>().toEqualTypeOf<{ id: string }>();
  });

  test("subscription", () => {
    expect.hasAssertions();

    expectTypeOf<ReturnType<Parameters<Record["subscribe"]["subscription"]>[0]>>().toExtend<
      AsyncIterable<number> | PromiseLike<AsyncIterable<number>>
    >();
  });
});
