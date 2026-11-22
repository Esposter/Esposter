// @vitest-environment nuxt
import { createResourceListItem } from "#shared/services/resource/list/createResourceListItem.test";
import { useResourceStore } from "#src/store/resource/index";
import { useSurveyResponseDialogStore } from "#src/store/resource/surveyResponseDialog";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe(useSurveyResponseDialogStore, () => {
  // The delete dialog resolves no item, so a target carried across would re-open it over the next survey's
  // Responses and delete by the first survey's row key
  test("keeps a survey's dialog targets to that survey", () => {
    expect.hasAssertions();

    const resourceStore = useResourceStore();
    const { applyResource } = resourceStore;
    applyResource(createResourceListItem(), null, null);
    const surveyResponseDialogStore = useSurveyResponseDialogStore();
    const { deletingResponseId, detailResponseId } = storeToRefs(surveyResponseDialogStore);
    const responseId = v7();
    deletingResponseId.value = responseId;
    detailResponseId.value = responseId;
    applyResource(createResourceListItem(), null, null);

    expect({ deletingResponseId: deletingResponseId.value, detailResponseId: detailResponseId.value }).toStrictEqual({
      deletingResponseId: "",
      detailResponseId: "",
    });
  });
});
