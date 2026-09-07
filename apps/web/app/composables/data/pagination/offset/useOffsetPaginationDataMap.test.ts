// @vitest-environment nuxt
import type { VueWrapper } from "@vue/test-utils";

import { OffsetPaginationData } from "#shared/models/pagination/offset/OffsetPaginationData";
import { createPendingQuery } from "@/composables/data/pagination/createPendingQuery.test";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { afterEach, describe, expect, test, vi } from "vitest";

describe(useOffsetPaginationDataMap, () => {
  const key = "key";
  const otherKey = "otherKey";
  const item = "item";
  let wrapper: VueWrapper;
  let currentId: Ref<string>;
  let getReadMoreItems: ReturnType<typeof useOffsetPaginationOperationData<string>>["getReadMoreItems"];
  let items: ReturnType<typeof useOffsetPaginationOperationData<string>>["items"];
  let readItems: ReturnType<typeof useOffsetPaginationOperationData<string>>["readItems"];
  let readMoreItems: ReturnType<typeof useOffsetPaginationOperationData<string>>["readMoreItems"];

  const mountDataMap = async () => {
    wrapper = await mountSuspended(
      defineComponent({
        render: () => h("div"),
        setup: () => {
          currentId = ref(key);
          ({ getReadMoreItems, items, readItems, readMoreItems } = useOffsetPaginationDataMap<string>(currentId));
        },
      }),
    );
    await flushPromises();
  };
  const createPendingRead = () => {
    const data = new OffsetPaginationData<string>();
    data.items = [item];
    return createPendingQuery(data);
  };

  afterEach(() => {
    wrapper?.unmount();
    vi.restoreAllMocks();
  });

  test("files a slow read under the key it was issued for, not the key that is current when it lands", async () => {
    expect.hasAssertions();

    await mountDataMap();
    const { query, resolveQuery } = createPendingRead();
    const pendingRead = readItems(query);
    // The target switches while the read for the original key is still in flight
    currentId.value = otherKey;
    await flushPromises();
    resolveQuery();
    await pendingRead;

    expect(items.value).toStrictEqual([]);

    currentId.value = key;
    await flushPromises();

    expect(items.value).toStrictEqual([item]);
  });

  test("files a slow offset page under the key it was issued for", async () => {
    expect.hasAssertions();

    await mountDataMap();
    const { query, resolveQuery } = createPendingRead();
    const pendingRead = getReadMoreItems(query)();
    currentId.value = otherKey;
    await flushPromises();
    resolveQuery();
    await pendingRead;

    expect(items.value).toStrictEqual([]);

    currentId.value = key;
    await flushPromises();

    expect(items.value).toStrictEqual([item]);
  });

  // The waypoint re-arms on completion and can fire again while the page it asked for is still in flight. Both
  // Calls read the same length, so without single-flight they request the same offset and append it twice
  test("appends one page when two reads overlap", async () => {
    expect.hasAssertions();

    await mountDataMap();
    const page = new OffsetPaginationData<string>();
    page.items = [item];
    const query = vi.fn<(offset: number) => Promise<OffsetPaginationData<string>>>(() => Promise.resolve(page));
    await Promise.all([readMoreItems(query), readMoreItems(query)]);

    expect(query).toHaveBeenCalledTimes(1);
    expect(items.value).toStrictEqual([item]);
  });
});
