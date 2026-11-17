// @vitest-environment nuxt
import type { Page } from "@esposter/db-schema";

import { BACKOFF_BASE_DELAY_MS } from "#shared/services/pagination/constants";
import { createPendingQuery } from "#src/composables/data/pagination/createPendingQuery.test";
import { goOffline, goOnline } from "#src/composables/shared/network.test";
import { readActiveTopics } from "#src/services/realtime/collectTopics";
import { openRealtimeSocket, sendRealtimeFrame } from "#src/services/realtime/openRealtimeSocket.test";
import { useConnectionStore } from "#src/store/realtime/connection";
import { createEmptyPage, getTopic, TopicKind } from "@esposter/db-schema";
import { waitForSynchronizedFunctions } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

vi.mock(
  import("#src/services/realtime/openRealtimeSocket"),
  () => import("#src/services/realtime/openRealtimeSocket.test"),
);

describe(useCursorPaginationOperationData, () => {
  const key = "key";
  const item = "item";
  const nextCursor = "nextCursor";
  let hydratingNuxtApp: ReturnType<typeof useNuxtApp> | undefined;
  let isLoaded: ReturnType<typeof useCursorPaginationOperationData<string>>["isLoaded"];
  let items: ReturnType<typeof useCursorPaginationOperationData<string>>["items"];
  let readItems: ReturnType<typeof useCursorPaginationOperationData<string>>["readItems"];
  let readMoreItems: ReturnType<typeof useCursorPaginationOperationData<string>>["readMoreItems"];

  const mountWithMorePages = async () => {
    await mountSuspended(
      defineComponent({
        render: () => h("div"),
        setup: () => {
          const cursorPaginationData = ref(createEmptyPage<string>());
          cursorPaginationData.value.nextCursor = nextCursor;
          const isLoadedSource = ref(false);
          ({ items, readItems, readMoreItems } = useCursorPaginationOperationData(
            () => cursorPaginationData,
            () => isLoadedSource,
          ));
        },
      }),
    );
    await flushPromises();
  };

  beforeEach(() => {
    goOnline();
  });

  afterEach(() => {
    if (hydratingNuxtApp) {
      hydratingNuxtApp.isHydrating = false;
      delete hydratingNuxtApp.payload.data[key];
      hydratingNuxtApp = undefined;
    }
    vi.restoreAllMocks();
  });

  test("adopts the server's page from the payload instead of querying again while hydrating", async () => {
    expect.hasAssertions();

    // The payload rides to the client as plain data, so the fixture is the shape hydration really reads
    const serverPage: Page<string> = { items: [item], nextCursor: "" };
    const topic = getTopic(TopicKind.Feed, "posts");
    useConnectionStore().openUser();
    await mountSuspended(
      defineComponent({
        render: () => h("div"),
        setup: () => {
          hydratingNuxtApp = useNuxtApp();
          hydratingNuxtApp.isHydrating = true;
          hydratingNuxtApp.payload.data[key] = { page: serverPage, topics: [topic] };
          const cursorPaginationData = ref(createEmptyPage<string>());
          const isLoadedSource = ref(false);
          ({ isLoaded, items, readItems } = useCursorPaginationOperationData(
            () => cursorPaginationData,
            () => isLoadedSource,
          ));
        },
      }),
    );
    await flushPromises();

    const query = vi.fn<() => Promise<Page<string>>>();

    const { isPending } = await readItems(query, { key });

    expect(query).not.toHaveBeenCalled();
    expect(items.value).toStrictEqual([item]);
    expect(isLoaded.value).toBe(true);
    expect(isPending.value).toBe(false);
    // The server render's topics are watched, so a page adopted from it stays as live as one read here
    expect(sendRealtimeFrame).toHaveBeenCalledExactlyOnceWith(
      JSON.stringify({ data: { topics: [topic] }, type: "watch" }),
    );
  });

  // The feed's rows are live: a write that changed what the first page came from updates the rows it names, and a
  // Reader who has paged on keeps the pages after it
  test("updates the rows an invalidated topic names and leaves the pages after the first alone", async () => {
    expect.hasAssertions();

    interface Row {
      description: string;
      id: string;
    }

    const topic = getTopic(TopicKind.Feed, "posts");
    const firstRow: Row = { description: "before", id: "first" };
    const laterRow: Row = { description: "later", id: "later" };
    useConnectionStore().openUser();
    const [, onFrame] = vi.mocked(openRealtimeSocket).mock.lastCall ?? [];
    let rowItems: ReturnType<typeof useCursorPaginationOperationData<Row>>["items"];
    let rowReadItems: ReturnType<typeof useCursorPaginationOperationData<Row>>["readItems"];
    let rowReadMoreItems: ReturnType<typeof useCursorPaginationOperationData<Row>>["readMoreItems"];
    await mountSuspended(
      defineComponent({
        render: () => h("div"),
        setup: () => {
          const cursorPaginationData = ref(createEmptyPage<Row>());
          const isLoadedSource = ref(false);
          ({
            items: rowItems,
            readItems: rowReadItems,
            readMoreItems: rowReadMoreItems,
          } = useCursorPaginationOperationData(
            () => cursorPaginationData,
            () => isLoadedSource,
          ));
        },
      }),
    );
    let description = firstRow.description;
    await rowReadItems(() => {
      readActiveTopics()?.push(topic);
      return Promise.resolve({ items: [{ ...firstRow, description }], nextCursor });
    });
    await rowReadMoreItems(() => Promise.resolve({ items: [laterRow], nextCursor: "" }));
    description = "after";
    onFrame?.(JSON.stringify({ data: { topic }, type: "invalidate" }));
    await waitForSynchronizedFunctions();

    expect(rowItems.value).toStrictEqual([{ ...firstRow, description }, laterRow]);
  });

  test("says a failed read failed without throwing, and clears it once a refresh lands", async () => {
    expect.hasAssertions();

    await mountSuspended(
      defineComponent({
        render: () => h("div"),
        setup: () => {
          const cursorPaginationData = ref(createEmptyPage<string>());
          const isLoadedSource = ref(false);
          ({ items, readItems } = useCursorPaginationOperationData(
            () => cursorPaginationData,
            () => isLoadedSource,
          ));
        },
      }),
    );
    const query = vi
      .fn<() => Promise<Page<string>>>()
      .mockRejectedValueOnce(new Error(item))
      .mockResolvedValueOnce({ items: [item], nextCursor: "" });

    const { isError, isPending, refresh } = await readItems(query);

    expect(isError.value).toBe(true);
    expect(isPending.value).toBe(false);

    await refresh();

    expect(isError.value).toBe(false);
    expect(items.value).toStrictEqual([item]);
  });

  test("drops a late page of a read a newer read replaced", async () => {
    expect.hasAssertions();

    await mountWithMorePages();
    const newItem = "newItem";
    const { query: lateQuery, resolveQuery } = createPendingQuery<Page<string>>({ items: [item], nextCursor: "" });
    const readMore = readMoreItems(lateQuery);
    await readItems(() => Promise.resolve({ items: [newItem], nextCursor: "" }));
    resolveQuery();
    await readMore;

    expect(items.value).toStrictEqual([newItem]);
  });

  test("does not query more items while offline and still completes the waypoint cycle", async () => {
    expect.hasAssertions();

    goOffline();
    await mountWithMorePages();

    const query = vi.fn<(cursor?: string) => Promise<Page<string>>>();
    const onComplete = vi.fn<() => void>();

    await readMoreItems(query, onComplete);

    expect(query).not.toHaveBeenCalled();
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  test("paces retries with exponential backoff after a failing query", async () => {
    expect.hasAssertions();

    await mountWithMorePages();

    // Fire timers immediately so the retry pacing is observable without waiting out the real delay
    const setTimeoutSpy = vi.spyOn(globalThis, "setTimeout").mockImplementation((callback) => {
      callback();
      return 0 as never;
    });
    const error = new Error(" ");
    const query = vi.fn<(cursor?: string) => Promise<Page<string>>>(() => Promise.reject(error));
    const onComplete = vi.fn<() => void>();

    await expect(readMoreItems(query, onComplete)).rejects.toThrowErrorMatchingInlineSnapshot(`[Error:  ]`);

    expect(query).toHaveBeenCalledTimes(1);
    expect(setTimeoutSpy).not.toHaveBeenCalled();

    await expect(readMoreItems(query, onComplete)).rejects.toThrowErrorMatchingInlineSnapshot(`[Error:  ]`);

    expect(setTimeoutSpy.mock.lastCall?.[1]).toBe(BACKOFF_BASE_DELAY_MS);
    expect(query).toHaveBeenCalledTimes(2);
    expect(onComplete).toHaveBeenCalledTimes(2);
  });
});
