// @vitest-environment nuxt
import { createColumn } from "@/composables/resource/sheet/commands/createColumn.test";
import { createDataSource } from "@/composables/resource/sheet/commands/createDataSource.test";
import { createRow } from "@/composables/resource/sheet/commands/createRow.test";
import { setupCommandTest } from "@/composables/resource/sheet/commands/setupCommandTest.test";
import { setupWithDataSource } from "@/composables/resource/sheet/commands/setupWithDataSource.test";
import { createResourceListItem } from "@/services/resource/list/createResourceListItem.test";
import { useResourceStore } from "@/store/resource";
import { useFindReplaceStore } from "@/store/resource/sheet/findReplace";
import { describe, expect, test } from "vitest";

describe(useFindReplaceStore, () => {
  setupCommandTest();

  test("keeps a sheet's find and replace to that sheet", () => {
    expect.hasAssertions();

    setupWithDataSource();
    const resourceStore = useResourceStore();
    const { resource } = storeToRefs(resourceStore);
    const findReplaceStore = useFindReplaceStore();
    const { findValue, isFindReplaceOpen, replaceValue } = storeToRefs(findReplaceStore);
    findValue.value = " ";
    isFindReplaceOpen.value = true;
    replaceValue.value = " ";
    resource.value = createResourceListItem();

    expect({
      findValue: findValue.value,
      isFindReplaceOpen: isFindReplaceOpen.value,
      replaceValue: replaceValue.value,
    }).toStrictEqual({ findValue: "", isFindReplaceOpen: false, replaceValue: "" });
  });

  // Reset by the write rather than by a watch on the value, which a switch away and back also changes
  test("keeps a search on its occurrence across a switch to another sheet and back", async () => {
    expect.hasAssertions();

    setupWithDataSource(createDataSource([createColumn("")], [createRow({ "": 0 }), createRow({ "": 0 })]));
    const resourceStore = useResourceStore();
    const { resource } = storeToRefs(resourceStore);
    const sheetResource = resource.value;
    const findReplaceStore = useFindReplaceStore();
    const { currentOccurrenceIndex, findValue } = storeToRefs(findReplaceStore);
    const { goToOccurrence } = findReplaceStore;
    findValue.value = "0";
    goToOccurrence(1);
    resource.value = createResourceListItem();
    await nextTick();
    resource.value = sheetResource;
    await nextTick();

    expect(currentOccurrenceIndex.value).toBe(1);

    findValue.value = "0";

    expect(currentOccurrenceIndex.value).toBe(0);
  });
});
