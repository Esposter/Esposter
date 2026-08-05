// @vitest-environment nuxt
import type { VueWrapper } from "@vue/test-utils";

import { OffsetPaginationData } from "#shared/models/pagination/offset/OffsetPaginationData";
import { noop } from "@esposter/shared";
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

  const mountDataMap = async () => {
    wrapper = await mountSuspended(
      defineComponent({
        render: () => h("div"),
        setup: () => {
          currentId = ref(key);
          ({ getReadMoreItems, items, readItems } = useOffsetPaginationDataMap<string>(currentId));
        },
      }),
    );
    await flushPromises();
  };
  const getPendingData = () => {
    const data = new OffsetPaginationData<string>();
    data.items = [item];
    let resolveQuery: (data: OffsetPaginationData<string>) => void = noop;
    const query = () =>
      new Promise<OffsetPaginationData<string>>((resolve) => {
        resolveQuery = resolve;
      });
    return {
      query,
      resolveQuery: () => {
        resolveQuery(data);
      },
    };
  };

  afterEach(() => {
    wrapper?.unmount();
    vi.restoreAllMocks();
  });

  test("files a slow read under the key it was issued for, not the key that is current when it lands", async () => {
    expect.hasAssertions();

    await mountDataMap();
    const { query, resolveQuery } = getPendingData();
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
    const { query, resolveQuery } = getPendingData();
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
});
