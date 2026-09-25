// @vitest-environment nuxt
import { createResourceListItem } from "@/services/resource/list/createResourceListItem.test";
import { useResourceStore } from "@/store/resource";
import { useSurveyResponseDialogStore } from "@/store/resource/surveyResponseDialog";
import { describe, expect, test } from "vitest";

describe(useSurveyResponseDialogStore, () => {
  // The delete dialog resolves no item, so a target carried across would re-open it over the next survey's
  // Responses and delete by the first survey's row key
  test("keeps a survey's dialog targets to that survey", () => {
    expect.hasAssertions();

    const resourceStore = useResourceStore();
    const { resource } = storeToRefs(resourceStore);
    resource.value = createResourceListItem();
    const surveyResponseDialogStore = useSurveyResponseDialogStore();
    const { deletingRowKey, detailRowKey } = storeToRefs(surveyResponseDialogStore);
    deletingRowKey.value = "rowKey";
    detailRowKey.value = "rowKey";
    resource.value = createResourceListItem();

    expect({ deletingRowKey: deletingRowKey.value, detailRowKey: detailRowKey.value }).toStrictEqual({
      deletingRowKey: "",
      detailRowKey: "",
    });
  });
});
