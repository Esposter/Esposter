// @vitest-environment nuxt
import MessageModelMessageList from "#src/components/Message/Model/Message/List/Index.vue";
import { createOptimisticMessage } from "#src/services/message/createOptimisticMessage";
import { useDataStore } from "#src/store/message/data";
import { setRouteId } from "#src/util/router/setRouteId.test";
import { MessageType } from "@esposter/db-schema";
import { noop } from "@esposter/shared";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

// The read is not what this proves, so the list reads nothing and its messages are set in the store
mockNuxtImport("useReadMessages", () => () => ({
  readMessages: () => ({ isError: false, isPending: false, refresh: noop }),
  readMoreMessages: noop,
  readMoreNewerMessages: noop,
}));

const press = async (key: string) => {
  document.activeElement?.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key }));
  await flushPromises();
};

describe("messageModelMessageList", () => {
  const roomId = v7();
  const userId = v7();
  // The newest message first, which is also the order a column-reversed list draws them in
  const rowIds = [3, 2, 1];

  // The list is one tab stop: the arrows move it between rows, from the newest, which Tab lands on, to the older and back
  test("walks one tab stop through the rows with the arrows", async () => {
    expect.hasAssertions();

    // The room and its messages are set inside the mount, so the rows' async message components load within it
    const component = await mountSuspended(
      defineComponent({
        setup: () => {
          setRouteId(roomId);
          const dataStore = useDataStore();
          const { getSlice } = dataStore;
          getSlice(roomId).items.value = rowIds.map((id) => ({
            ...createOptimisticMessage({ message: "", roomId, type: MessageType.Message }, userId),
            id,
          }));
          return () => h(MessageModelMessageList);
        },
      }),
      { attachTo: document.body },
    );
    // Only the rows are read, since the options bar a focused row mounts has tab stops of its own
    const readTabStops = () => rowIds.filter((id) => component.get(`[id="${id}"]`).attributes("tabindex") === "0");

    expect(readTabStops()).toStrictEqual([3]);

    component.get<HTMLElement>('[id="3"]').element.focus();
    await press("ArrowUp");

    expect(document.activeElement?.id).toBe("2");
    expect(readTabStops()).toStrictEqual([2]);

    await press("ArrowDown");

    expect(document.activeElement?.id).toBe("3");
    expect(readTabStops()).toStrictEqual([3]);
  });
});
