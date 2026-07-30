// @vitest-environment nuxt
import { useSingletonDialogTarget } from "@/composables/useSingletonDialogTarget";
import { describe, expect, test } from "vitest";

describe(useSingletonDialogTarget, () => {
  const id = "a";
  const otherId = "b";

  test("resolves the item its target names", () => {
    expect.hasAssertions();

    const target = ref(id);
    const items = ref([{ id }]);
    const item = useSingletonDialogTarget(target, () => items.value.find((current) => current.id === target.value));

    expect(item.value).toStrictEqual({ id });
  });

  // The dialog is mounted with `v-if="item"`, so a read that drops the row unmounts it while the target ref stays
  // Set — and the dialog then re-opens by itself, over that row, the moment a later read brings it back
  test("drops the target when a read takes its item out of the list", async () => {
    expect.hasAssertions();

    const target = ref(id);
    const items = ref([{ id }]);
    const item = useSingletonDialogTarget(target, () => items.value.find((current) => current.id === target.value));
    items.value = [{ id: otherId }];
    await nextTick();

    expect(item.value).toBeUndefined();
    expect(target.value).toBe("");
  });

  test("holds the target while its item is still in the list", async () => {
    expect.hasAssertions();

    const target = ref(id);
    const items = ref([{ id }]);
    useSingletonDialogTarget(target, () => items.value.find((current) => current.id === target.value));
    items.value = [{ id }, { id: otherId }];
    await nextTick();

    expect(target.value).toBe(id);
  });
});
