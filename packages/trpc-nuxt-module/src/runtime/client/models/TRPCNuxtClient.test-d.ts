// @TODO: no upstream issue — @ark/attest cannot count instantiations through the tsgo-backed `typescript`, whose `@typescript/vfs` program loses attest's probe file; once it can, this suite gains the client's instantiation budgets over the app router
import type { TRPCNuxtClient } from "#src/runtime/client/models/TRPCNuxtClient";

import { initTRPC } from "@trpc/server";
import { describe, expect, expectTypeOf, test } from "vitest";
import { z } from "zod";

const t = initTRPC.create();
const router = t.router({
  // oxlint-disable-next-line require-await -- A subscription is an AsyncIterable, which only an async generator yields
  count: t.procedure.subscription(async function* () {
    yield 0;
  }),
  nested: t.router({ read: t.procedure.input(z.string()).query(() => [0]) }),
  write: t.procedure.input(z.string()).mutation(() => 0),
});
type Client = TRPCNuxtClient<typeof router>;
const readQueryData = (client: Client) => client.nested.read.useQuery("").data.value;
const readTransformedQueryData = (client: Client) =>
  client.nested.read.useQuery("", { default: () => "", transform: (data) => data.join("") }).data.value;
const mutate = (client: Client) => client.write.useMutation().mutate("");
const readSubscriptionData = (client: Client) => client.count.useSubscription(undefined).data.value;

describe("tRPCNuxtClient type", () => {
  test("#255 #233 types a query's data, undefined until it arrives", () => {
    expect.hasAssertions();

    expectTypeOf<ReturnType<typeof readQueryData>>().toEqualTypeOf<number[] | undefined>();
  });

  test("#92 #162 types a query's data by its transform and its default", () => {
    expect.hasAssertions();

    expectTypeOf<ReturnType<typeof readTransformedQueryData>>().toEqualTypeOf<string>();
  });

  test("#89 types a lazy query as a query", () => {
    expect.hasAssertions();

    expectTypeOf<Client["nested"]["read"]["useLazyQuery"]>().toEqualTypeOf<Client["nested"]["read"]["useQuery"]>();
  });

  test("#190 takes a mutation's input and resolves with its output", () => {
    expect.hasAssertions();

    expectTypeOf<ReturnType<typeof mutate>>().toEqualTypeOf<Promise<number | undefined>>();
  });

  test("#210 types a subscription's data", () => {
    expect.hasAssertions();

    expectTypeOf<ReturnType<typeof readSubscriptionData>>().toEqualTypeOf<number | undefined>();
  });
});
