// @vitest-environment nuxt
import type { SerializableValue } from "@esposter/azure";

import AuthorTypePicker from "@/components/Message/RightSideBar/Search/Filter/AuthorTypePicker.vue";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import { UiStyles } from "@/models/ui/UiStyle";
import { FilterTypeAuthorType } from "@esposter/db-schema";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { assert, describe, expect, test } from "vitest";

describe("authorTypePicker", () => {
  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

    test("is a named list and selects an author type", async () => {
      expect.hasAssertions();

      const component = await mountSuspended(AuthorTypePicker, { attachTo: document.body });
      const list = component.get('[role="list"]');
      const firstOption = list.get("button");
      firstOption.element.focus();
      await firstOption.trigger("keydown", { key: "ArrowDown" });
      await flushPromises();
      const secondOption = list.findAll("button")[1];
      assert.exists(secondOption);

      expect(list.attributes("aria-label")).toBe("Options");
      expect(list.findAll('[role="listitem"]').map((item) => item.text())).toStrictEqual(["User", "Webhook"]);
      expect(document.activeElement).toBe(secondOption.element);
      await secondOption.trigger("click");
      expect(component.emitted<[SerializableValue]>("select")).toStrictEqual([[FilterTypeAuthorType.Webhook]]);

      component.unmount();
    });
  });
});
