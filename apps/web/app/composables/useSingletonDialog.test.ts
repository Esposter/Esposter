// @vitest-environment nuxt
import { useSingletonDialog } from "@/composables/useSingletonDialog";
import { describe, expect, test } from "vitest";

describe(useSingletonDialog, () => {
  const id = "a";
  const otherId = "b";

  test("resolves the item its target names", () => {
    expect.hasAssertions();

    const target = ref(id);
    const items = ref([{ id }]);
    const { item } = useSingletonDialog(target, () => items.value.find((current) => current.id === target.value));

    expect(item.value).toStrictEqual({ id });
  });

  test("is open while the target is set, and clears it on close", () => {
    expect.hasAssertions();

    const target = ref(id);
    const { isOpen } = useSingletonDialog(target);

    expect(isOpen.value).toBe(true);

    isOpen.value = false;

    expect(target.value).toBe("");
  });

  // A dialog whose parent owns the lookup passes no item and must keep its target: reconciling against an item
  // It was never given would clear the target the moment the dialog opened
  test("keeps the target when no item is passed", async () => {
    expect.hasAssertions();

    const target = ref(id);
    const { item } = useSingletonDialog(target);
    await nextTick();

    expect(item.value).toBeUndefined();
    expect(target.value).toBe(id);
  });

  // The dialog is mounted with `v-if="item"`, so a read that drops the row unmounts it while the target ref stays
  // Set — and the dialog then re-opens by itself, over that row, the moment a later read brings it back
  test("drops the target when a read takes its item out of the list", async () => {
    expect.hasAssertions();

    const target = ref(id);
    const items = ref([{ id }]);
    const { item } = useSingletonDialog(target, () => items.value.find((current) => current.id === target.value));
    items.value = [{ id: otherId }];
    await nextTick();

    expect(item.value).toBeUndefined();
    expect(target.value).toBe("");
  });

  test("holds the target while its item is still in the list", async () => {
    expect.hasAssertions();

    const target = ref(id);
    const items = ref([{ id }]);
    useSingletonDialog(target, () => items.value.find((current) => current.id === target.value));
    items.value = [{ id }, { id: otherId }];
    await nextTick();

    expect(target.value).toBe(id);
  });
});
