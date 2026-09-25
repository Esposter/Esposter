// @vitest-environment nuxt
import type { Dataset } from "#shared/models/dataset/Dataset";

import { createResourceListItem } from "@/services/resource/list/createResourceListItem.test";
import { useEmailExportDialogStore } from "@/store/emailEditor/exportDialog";
import { useResourceStore } from "@/store/resource";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

describe(useEmailExportDialogStore, () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  // The dataset is read after an await, so the reader can have opened another email by the time it is staged —
  // Confirmed there, one email's audience would be exported into the next one's template
  test("stages a capped dataset only for the email the export was started on", () => {
    expect.hasAssertions();

    const resourceStore = useResourceStore();
    const { resource } = storeToRefs(resourceStore);
    const email = createResourceListItem();
    resource.value = email;
    const emailExportDialogStore = useEmailExportDialogStore();
    const { setPendingDataset } = emailExportDialogStore;
    const { pendingDataset } = storeToRefs(emailExportDialogStore);
    const dataset: Dataset = { columns: [], rows: [] };
    resource.value = createResourceListItem();
    setPendingDataset(email.id, dataset);

    expect(pendingDataset.value).toBeUndefined();

    resource.value = email;

    expect(pendingDataset.value).toStrictEqual(dataset);
  });
});
