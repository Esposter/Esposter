// @vitest-environment nuxt
import { createColumn } from "#shared/models/resource/sheet/column/createColumn.test";
import { createDataSource } from "#shared/models/resource/sheet/datasource/createDataSource.test";
import { createRow } from "#shared/models/resource/sheet/datasource/createRow.test";
import { createResourceListItem } from "#shared/services/resource/list/createResourceListItem.test";
import { setupCommandTest } from "#src/composables/resource/sheet/commands/setupCommandTest.test";
import { setupWithDataSource } from "#src/composables/resource/sheet/commands/setupWithDataSource.test";
import { useResourceStore } from "#src/store/resource/index";
import { useFindReplaceStore } from "#src/store/resource/sheet/findReplace";
import { assert, describe, expect, test } from "vitest";

describe(useFindReplaceStore, () => {
  setupCommandTest();

  test("keeps a sheet's find and replace to that sheet", () => {
    expect.hasAssertions();

    setupWithDataSource();
    const resourceStore = useResourceStore();
    const { applyResource } = resourceStore;
    const findReplaceStore = useFindReplaceStore();
    const { findValue, isFindReplaceOpen, replaceValue } = storeToRefs(findReplaceStore);
    findValue.value = " ";
    isFindReplaceOpen.value = true;
    replaceValue.value = " ";
    applyResource(createResourceListItem(), null);

    expect({
      findValue: findValue.value,
      isFindReplaceOpen: isFindReplaceOpen.value,
      replaceValue: replaceValue.value,
    }).toStrictEqual({ findValue: "", isFindReplaceOpen: false, replaceValue: "" });
  });

  // Reset by the write rather than by a watch on the value, which a switch away and back also changes
  test("keeps a search's occurrence across a switch to another sheet and back, and resets it when the search is written again", async () => {
    expect.hasAssertions();

    setupWithDataSource(createDataSource([createColumn("")], [createRow({ "": 0 }), createRow({ "": 0 })]));
    const resourceStore = useResourceStore();
    const { resource } = storeToRefs(resourceStore);
    const { applyResource } = resourceStore;
    const sheetResource = resource.value;
    assert.exists(sheetResource);
    const findReplaceStore = useFindReplaceStore();
    const { currentOccurrenceIndex, findValue } = storeToRefs(findReplaceStore);
    const { goToOccurrence } = findReplaceStore;
    findValue.value = "0";
    goToOccurrence(1);
    applyResource(createResourceListItem(), null);
    await nextTick();
    applyResource(sheetResource, null);
    await nextTick();

    expect(currentOccurrenceIndex.value).toBe(1);

    findValue.value = "0";

    expect(currentOccurrenceIndex.value).toBe(0);
  });

  // A switch re-keys the search before the other sheet's content is read, so until that read the occurrences are the
  // Previous sheet's matches, and clamping the saved occurrence against them would reset it before the new sheet's exist
  test("holds a search's occurrence while the other sheet's content is not yet read", async () => {
    expect.hasAssertions();

    setupWithDataSource(createDataSource([createColumn("")], [createRow({ "": 0 })]));
    const resourceStore = useResourceStore();
    const { applyResource } = resourceStore;
    const findReplaceStore = useFindReplaceStore();
    const { currentOccurrenceIndex, findValue } = storeToRefs(findReplaceStore);
    applyResource(createResourceListItem(), null);
    findValue.value = "0";
    currentOccurrenceIndex.value = 2;
    await nextTick();

    expect(currentOccurrenceIndex.value).toBe(2);
  });
});
