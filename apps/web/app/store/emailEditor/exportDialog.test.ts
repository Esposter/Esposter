// @vitest-environment nuxt
import type { Dataset } from "#shared/models/dataset/Dataset";

import { createResourceListItem } from "#shared/services/resource/list/createResourceListItem.test";
import { useEmailExportDialogStore } from "#src/store/emailEditor/exportDialog";
import { useResourceStore } from "#src/store/resource/index";
import { describe, expect, test } from "vitest";

describe(useEmailExportDialogStore, () => {
  // The dataset is read after an await, so the reader can have opened another email by the time it is staged —
  // Confirmed there, one email's audience would be exported into the next one's template
  test("stages a capped dataset only for the email the export was started on", () => {
    expect.hasAssertions();

    const resourceStore = useResourceStore();
    const { applyResource } = resourceStore;
    const email = createResourceListItem();
    applyResource(email, null);
    const emailExportDialogStore = useEmailExportDialogStore();
    const { setPendingDataset } = emailExportDialogStore;
    const { pendingDataset } = storeToRefs(emailExportDialogStore);
    const dataset: Dataset = { columns: [], rows: [] };
    applyResource(createResourceListItem(), null);
    setPendingDataset(email.id, dataset);

    expect(pendingDataset.value).toBeUndefined();

    applyResource(email, null);

    expect(pendingDataset.value).toStrictEqual(dataset);
  });
});
