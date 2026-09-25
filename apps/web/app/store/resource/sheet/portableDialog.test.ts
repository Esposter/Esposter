// @vitest-environment nuxt
import { createDataSource } from "@/composables/resource/sheet/commands/createDataSource.test";
import { setupCommandTest } from "@/composables/resource/sheet/commands/setupCommandTest.test";
import { setupWithDataSource } from "@/composables/resource/sheet/commands/setupWithDataSource.test";
import { createResourceListItem } from "@/services/resource/list/createResourceListItem.test";
import { useResourceStore } from "@/store/resource";
import { useSheetPortableDialogStore } from "@/store/resource/sheet/portableDialog";
import { describe, expect, test } from "vitest";

describe(useSheetPortableDialogStore, () => {
  setupCommandTest();

  // A file is parsed after an await, so the reader can have moved to another sheet by the time its preview opens —
  // Opened there, confirming it would import one sheet's file into another
  test("opens a preview only over the sheet it was started on", () => {
    expect.hasAssertions();

    setupWithDataSource();
    const resourceStore = useResourceStore();
    const { currentResourceId, resource } = storeToRefs(resourceStore);
    const resourceId = currentResourceId.value;
    const sheetResource = resource.value;
    const sheetPortableDialogStore = useSheetPortableDialogStore();
    const { openPreview } = sheetPortableDialogStore;
    const { isPreviewOpen } = storeToRefs(sheetPortableDialogStore);
    resource.value = createResourceListItem();
    openPreview(resourceId, createDataSource(), "");

    expect(isPreviewOpen.value).toBe(false);

    resource.value = sheetResource;

    expect(isPreviewOpen.value).toBe(true);
  });
});
