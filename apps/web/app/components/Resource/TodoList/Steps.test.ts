// @vitest-environment nuxt
import type { TodoListStep } from "#shared/models/resource/todoList/TodoListStep";

import { TODO_LIST_ITEM_STEPS_MAX_LENGTH } from "#shared/services/resource/item/constants";
import ResourceTodoListSteps from "@/components/Resource/TodoList/Steps.vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

describe("resourceTodoListSteps", () => {
  const name = "name";

  test("adds a step on Enter without letting the key reach the dialog's form", async () => {
    expect.hasAssertions();

    const wrapper = await mountSuspended(ResourceTodoListSteps, { props: { modelValue: undefined } });
    const field = wrapper.get('input[placeholder="Add step"]');
    await field.setValue(name);
    await flushPromises();
    const event = new KeyboardEvent("keydown", { bubbles: true, cancelable: true, key: "Enter" });
    field.element.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    expect(wrapper.emitted<[TodoListStep[]]>("update:modelValue")?.[0]?.[0].map((step) => step.name)).toStrictEqual([
      name,
    ]);
  });

  test("adds no step past the most the item's schema takes", async () => {
    expect.hasAssertions();

    const wrapper = await mountSuspended(ResourceTodoListSteps, {
      props: {
        modelValue: Array.from({ length: TODO_LIST_ITEM_STEPS_MAX_LENGTH }, () => ({ id: crypto.randomUUID(), name })),
      },
    });
    const field = wrapper.get('input[placeholder="Add step"]');
    await field.setValue(name);
    await field.trigger("keydown", { key: "Enter" });

    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
  });

  test("leaves no steps key once the last step is removed", async () => {
    expect.hasAssertions();

    const wrapper = await mountSuspended(ResourceTodoListSteps, {
      props: { modelValue: [{ id: crypto.randomUUID(), name }] },
    });
    await wrapper.get('[aria-label="Remove step"]').trigger("click");

    expect(wrapper.emitted("update:modelValue")).toStrictEqual([[undefined]]);
  });
});
