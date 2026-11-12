// @vitest-environment nuxt
import ClickerModelItemList from "@/components/Clicker/Model/ItemList.vue";
import UiList from "@/components/Ui/List/Index.vue";
import UiPopover from "@/components/Ui/Popover.vue";
import { DIALOG_CLOSE_DURATION_MS } from "@/services/ui/constants";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { afterEach, describe, expect, test, vi } from "vitest";

describe("clickerModelItemList", () => {
  const id = "id";
  const otherId = "otherId";
  const item = { id, price: 0 };
  const otherItem = { id: otherId, price: 0 };

  afterEach(() => {
    vi.useRealTimers();
  });

  // A bought upgrade leaves the store's list while its details are still open, and details rendered for an id the list
  // No longer holds hand the detail slot an item that is not there. The details are held through the popover's leave,
  // So they are gone once it has run
  test("closes an item's details once the item leaves the list", async () => {
    expect.hasAssertions();

    const component = await mountSuspended(ClickerModelItemList, {
      attachTo: document.body,
      props: { items: [item, otherItem], label: "label", positionArea: "" },
      slots: {
        detail: ({ item: detailItem }: { item: typeof otherItem }) => h("p", { class: "detail" }, detailItem.id),
      },
    });
    component.getComponent(UiList).vm.$emit("select", otherId);
    await nextTick();

    expect(component.get(".detail").text()).toBe(otherId);

    vi.useFakeTimers();
    await component.setProps({ items: [item] });
    vi.advanceTimersByTime(DIALOG_CLOSE_DURATION_MS);
    await nextTick();

    expect(component.find(".detail").exists()).toBe(false);
  });

  // A press on another row light-dismisses the open details natively before its click moves them there, and the
  // Browser reports that dismissal after the click: it is the first row's, so it must not clear the second row's
  test("keeps the details of the row pressed next when the first row's dismissal is reported after the move", async () => {
    expect.hasAssertions();

    const component = await mountSuspended(ClickerModelItemList, {
      attachTo: document.body,
      props: { items: [item, otherItem], label: "label", positionArea: "" },
      slots: {
        detail: ({ item: detailItem }: { item: typeof otherItem }) => h("p", { class: "detail" }, detailItem.id),
      },
    });
    const list = component.getComponent(UiList);
    list.vm.$emit("select", id);
    await nextTick();
    list.vm.$emit("select", otherId);
    await nextTick();
    component.get('[role="dialog"]').element.dispatchEvent(Object.assign(new Event("toggle"), { newState: "closed" }));
    await nextTick();

    expect(component.getComponent(UiPopover).props("isOpen")).toBe(true);
    expect(component.get(".detail").text()).toBe(otherId);
  });
});
