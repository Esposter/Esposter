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

  // A survey import awaits its dataset, so the reader can have moved to another sheet by the time it settles — closed
  // Ambiently, the sheet it started on would reopen its dialog when the reader comes back
  test("closes a survey import only on the sheet it was started on", () => {
    expect.hasAssertions();

    setupWithDataSource();
    const resourceStore = useResourceStore();
    const { currentResourceId, resource } = storeToRefs(resourceStore);
    const resourceId = currentResourceId.value;
    const sheetResource = resource.value;
    const sheetPortableDialogStore = useSheetPortableDialogStore();
    const { closeSurveyImport, openSurveyImport } = sheetPortableDialogStore;
    const { isSurveyImportOpen } = storeToRefs(sheetPortableDialogStore);
    openSurveyImport(resourceId);
    resource.value = createResourceListItem();
    closeSurveyImport(resourceId);
    resource.value = sheetResource;

    expect(isSurveyImportOpen.value).toBe(false);
  });
});
