import type { TRPCEventHandlerOptions } from "#src/runtime/server/models/TRPCEventHandlerOptions";
import type { H3Event } from "nitro/h3";
import type { RequestEvent } from "nuxt/server";

import { initTRPC } from "@trpc/server";
import { describe, expect, expectTypeOf, test } from "vitest";

describe("tRPCEventHandlerOptions type", () => {
  const t = initTRPC.create();
  const router = t.router({});

  test("#260 hands the context factory h3's own H3Event, which Nitro augments", () => {
    expect.hasAssertions();

    expectTypeOf<
      Parameters<NonNullable<TRPCEventHandlerOptions<typeof router>["createContext"]>>[0]
    >().toEqualTypeOf<H3Event>();
  });

  test("#264 hands the context factory an event Nuxt's RequestEvent accepts", () => {
    expect.hasAssertions();

    expectTypeOf<
      Parameters<NonNullable<TRPCEventHandlerOptions<typeof router>["createContext"]>>[0]
    >().toExtend<RequestEvent>();
  });
});
