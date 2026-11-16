import type { SurveyResource } from "#shared/models/resource/survey/SurveyResource";
import type { SurveySettings } from "#shared/models/resource/survey/SurveySettings";
import type { SurveyDocument } from "vue-survey-engine-headless";

import { surveySettingsSchema } from "#shared/models/resource/survey/SurveySettings";
import { createContentData } from "#src/services/resource/createContentData";
import { useResourceStore } from "#src/store/resource/index";
import { ResourceType } from "@esposter/db-schema";
import { createSurveyDocument } from "vue-survey-engine-headless";

export const useSurveyStore = defineStore("survey", () => {
  const resourceStore = useResourceStore();
  const { saveContent } = resourceStore;
  const { content, getContentWriter, loadContent } = createContentData(
    ResourceType.Survey,
    (data) => data ?? { document: createSurveyDocument(), settings: surveySettingsSchema.parse({}) },
  );
  // The creator owns its editing state; the resource layer only sees the document in and out
  const document = computed(() => content.value.document);
  // Collection settings share the survey's single content blob, so the Overview toggle and the editor
  // Save through the same path and the same contentVersion
  const settings = computed(() => content.value.settings);
  // The content is written at once, so a half saved while the other half's write is still in flight builds on that
  // Write, and `content` is always the latest content. A refused save puts back the content it replaced, through a
  // Writer bound before the write goes out so a rollback that lands after the blade moved on is not taken as the
  // Content open by then. A later save that wrote over this one keeps its own content
  const saveSurvey = (newContent: SurveyResource) => {
    if (!resourceStore.resource) return;

    const writeContent = getContentWriter();
    const previousContent = content.value;
    writeContent(newContent);
    const writtenContent = content.value;
    saveContent(newContent, () => {
      if (content.value === writtenContent) writeContent(previousContent);
    });
  };
  const saveDocument = (newDocument: SurveyDocument) => {
    saveSurvey({ ...content.value, document: newDocument });
  };
  const saveSettings = (newSettings: SurveySettings) => {
    saveSurvey({ ...content.value, settings: newSettings });
  };
  return { document, loadContent, saveDocument, saveSettings, settings };
});
