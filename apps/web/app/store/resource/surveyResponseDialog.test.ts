// @vitest-environment nuxt
import { createResourceListItem } from "#shared/services/resource/list/createResourceListItem.test";
import { useResourceStore } from "@/store/resource";
import { useSurveyResponseDialogStore } from "@/store/resource/surveyResponseDialog";
import { v7 } from "uuid";
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
    const { deletingResponseId, detailResponseId } = storeToRefs(surveyResponseDialogStore);
    const responseId = v7();
    deletingResponseId.value = responseId;
    detailResponseId.value = responseId;
    resource.value = createResourceListItem();

    expect({ deletingResponseId: deletingResponseId.value, detailResponseId: detailResponseId.value }).toStrictEqual({
      deletingResponseId: "",
      detailResponseId: "",
    });
  });
});
