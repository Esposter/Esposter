// @vitest-environment nuxt
import ClickerModelItemList from "@/components/Clicker/Model/ItemList.vue";
import UiList from "@/components/Ui/List/Index.vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { enableAutoUnmount } from "@vue/test-utils";
import { afterEach, describe, expect, test } from "vitest";

describe("clickerModelItemList", () => {
  enableAutoUnmount(afterEach);

  const id = "id";
  const otherId = "otherId";
  const item = { id, price: 0 };
  const otherItem = { id: otherId, price: 0 };

  // A bought upgrade leaves the store's list while its details are still open, and details rendered for an id the list
  // No longer holds hand the detail slot an item that is not there
  test("closes an item's details once the item leaves the list", async () => {
    expect.hasAssertions();

    const component = await mountSuspended(ClickerModelItemList, {
      attachTo: document.body,
      props: { items: [item, otherItem], label: "label", positionArea: "" },
      slots: { detail: ({ id: detailId }: { id: string }) => h("p", { class: "detail" }, detailId) },
    });
    component.getComponent(UiList).vm.$emit("select", otherId);
    await nextTick();

    expect(component.get(".detail").text()).toBe(otherId);

    await component.setProps({ items: [item] });

    expect(component.find(".detail").exists()).toBe(false);
  });
});
