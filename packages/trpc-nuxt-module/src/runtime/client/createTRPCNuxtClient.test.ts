// @vitest-environment nuxt
import { createTRPCNuxtClient } from "#src/runtime/client/createTRPCNuxtClient";
import { getQueryKey } from "#src/runtime/client/getQueryKey";
import { SubscriptionStatus } from "#src/runtime/client/models/SubscriptionStatus";
import { unstable_localLink } from "@trpc/client";
import { initTRPC, TRPCError } from "@trpc/server";
import { useNuxtData } from "nuxt/app";
import { describe, expect, test, vi } from "vitest";
import { nextTick, ref, watch } from "vue";
import { z } from "zod";

describe(createTRPCNuxtClient, () => {
  const t = initTRPC.create();
  const read = vi.fn<(input: number) => number>((input) => input);
  const router = t.router({
    // oxlint-disable-next-line require-await -- A subscription is an AsyncIterable, which only an async generator yields
    count: t.procedure.subscription(async function* () {
      yield 0;
    }),
    fail: t.procedure.mutation(() => {
      throw new TRPCError({ code: "BAD_REQUEST", message: " " });
    }),
    read: t.procedure.input(z.number()).query(({ input }) => read(input)),
  });
  const client = createTRPCNuxtClient<typeof router>({
    links: [unstable_localLink({ createContext: () => Promise.resolve({}), router })],
  });

  test("#239 fetches a changed input under its own key", async () => {
    expect.hasAssertions();

    const input = ref(0);
    const { data } = await client.read.useQuery(input);
    const changedData = Promise.withResolvers<number | undefined>();
    watch(data, (newData) => {
      changedData.resolve(newData);
    });
    input.value = 1;

    await expect(changedData.promise).resolves.toBe(1);
    expect(useNuxtData(getQueryKey(client.read, 1)).data.value).toBe(1);
  });

  test("#253 runs no query while disabled", async () => {
    expect.hasAssertions();

    const enabled = ref(false);
    const { data, execute } = client.read.useQuery(-1, { enabled });
    await execute();

    expect(read).not.toHaveBeenCalled();
    expect(data.value).toBeUndefined();

    enabled.value = true;
    await execute();

    expect(read).toHaveBeenCalledExactlyOnceWith(-1);
    expect(data.value).toBe(-1);
  });

  test("#224 rejects a mutate whose mutation failed", async () => {
    expect.hasAssertions();

    const { error, mutate } = client.fail.useMutation();

    await expect(mutate()).rejects.toThrowErrorMatchingInlineSnapshot(`[HTTPError:  ]`);
    expect(error.value?.data?.code).toBe("BAD_REQUEST");
  });

  test("#106 caches under a given query key", async () => {
    expect.hasAssertions();

    const queryKey = "a";
    await client.read.useQuery(0, { queryKey });

    expect(useNuxtData(queryKey).data.value).toBe(0);
  });

  test("#234 subscribes, and unsubscribes once disabled", async () => {
    expect.hasAssertions();

    const enabled = ref(true);
    const receivedData = Promise.withResolvers<number>();
    const { status } = client.count.useSubscription(undefined, {
      enabled,
      onData: (value) => {
        receivedData.resolve(value);
      },
    });

    await expect(receivedData.promise).resolves.toBe(0);

    enabled.value = false;
    await nextTick();

    expect(status.value).toBe(SubscriptionStatus.Idle);
  });
});
