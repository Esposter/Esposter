// @vitest-environment nuxt
import { readActiveTopics } from "#src/services/realtime/collectTopics";
import { openRealtimeSocket, sendRealtimeFrame } from "#src/services/realtime/openRealtimeSocket.test";
import { useAlertStore } from "#src/store/alert";
import { useConnectionStore } from "#src/store/realtime/connection";
import { getTopic, TopicKind } from "@esposter/db-schema";
import { waitForSynchronizedFunctions } from "@esposter/shared";
import { v7 } from "uuid";
import { describe, expect, test, vi } from "vitest";

vi.mock(
  import("#src/services/realtime/openRealtimeSocket"),
  () => import("#src/services/realtime/openRealtimeSocket.test"),
);

describe(useQuery, () => {
  const result = "result";
  const rejection = new Error(" ");

  test("populates data with the resolved result", async () => {
    expect.hasAssertions();

    const { data, refresh } = useQuery(() => Promise.resolve(result));
    await refresh();

    expect(data.value).toBe(result);
  });

  test("reports pending for the duration of the read", async () => {
    expect.hasAssertions();

    const { promise, resolve }: PromiseWithResolvers<string> = Promise.withResolvers();
    const { data, isPending } = useQuery(() => promise);

    expect(isPending.value).toBe(true);

    resolve(result);
    await waitForSynchronizedFunctions();

    expect(isPending.value).toBe(false);
    expect(data.value).toBe(result);
  });

  test("waits for the first refresh when lazy", async () => {
    expect.hasAssertions();

    const { data, isPending, refresh } = useQuery(() => Promise.resolve(result), { isLazy: true });

    expect(isPending.value).toBe(false);
    expect(data.value).toBeUndefined();

    await refresh();

    expect(data.value).toBe(result);
  });

  test("alerts and leaves data undefined on failure", async () => {
    expect.hasAssertions();

    const alertStore = useAlertStore();
    const { alerts } = storeToRefs(alertStore);
    const { data, refresh } = useQuery(() => Promise.reject(rejection));
    await refresh();

    expect(data.value).toBeUndefined();
    expect(alerts.value).toHaveLength(1);
  });

  test("reports the failure through error instead of the toast when it is rendered inline", async () => {
    expect.hasAssertions();

    const alertStore = useAlertStore();
    const { alerts } = storeToRefs(alertStore);
    const { error, refresh } = useQuery(() => Promise.reject(rejection), { isInlineError: true });
    await refresh();

    expect(error.value).toBe(rejection.message);
    expect(alerts.value).toHaveLength(0);
  });

  test("clears a previous failure once the read lands", async () => {
    expect.hasAssertions();

    let isFailing = true;
    const { data, error, refresh } = useQuery(() => (isFailing ? Promise.reject(rejection) : Promise.resolve(result)), {
      isInlineError: true,
    });
    await waitForSynchronizedFunctions();

    expect(error.value).toBe(rejection.message);

    isFailing = false;
    await refresh();

    expect(error.value).toBe("");
    expect(data.value).toBe(result);
  });

  // A read is live by going through the primitive: the write that changed a topic its answer came from reads it again
  test("reads again when a topic its answer came from is invalidated", async () => {
    expect.hasAssertions();

    const connectionStore = useConnectionStore();
    connectionStore.openUser();
    const [, onFrame] = vi.mocked(openRealtimeSocket).mock.lastCall ?? [];
    const topic = getTopic(TopicKind.Post, v7());
    let value = result;
    const scope = effectScope();
    const query = scope.run(() =>
      useQuery(() => {
        readActiveTopics()?.push(topic);
        return Promise.resolve(value);
      }),
    );
    await waitForSynchronizedFunctions();
    value = "updated";
    onFrame?.(JSON.stringify({ data: { topic }, type: "invalidate" }));
    await waitForSynchronizedFunctions();
    scope.stop();

    expect(query?.data.value).toBe("updated");
  });

  // A read still in flight when its surface unmounts answers into nothing, so it must not watch the topics it names
  test("takes no topic watch for a read that answers after its surface unmounted", async () => {
    expect.hasAssertions();

    const connectionStore = useConnectionStore();
    connectionStore.openUser();
    const topic = getTopic(TopicKind.Post, v7());
    const { promise: isReadReached, resolve: onReadReached } = Promise.withResolvers<void>();
    const { promise, resolve }: PromiseWithResolvers<string> = Promise.withResolvers();
    const scope = effectScope();
    scope.run(() =>
      useQuery(() => {
        // The topics link reads a read's topics from its response header, which the tRPC mock does not send, so the
        // Read names its topic into the collector directly
        readActiveTopics()?.push(topic);
        onReadReached();
        return promise;
      }),
    );
    await isReadReached;
    scope.stop();
    resolve(result);
    await waitForSynchronizedFunctions();

    expect(sendRealtimeFrame).not.toHaveBeenCalled();
  });
});
