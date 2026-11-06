// @vitest-environment nuxt
import type { SurveyPageNode } from "vue-survey-engine-headless";

import { useSurveyCreatorStore } from "@/store/survey/creator";
import { createSurveyDocument, SurveyNodeType, surveyNodeTypeDefinitionMap } from "vue-survey-engine-headless";
import { createPinia, setActivePinia } from "pinia";
import { describe, expect, test } from "vitest";

const createPage = (): SurveyPageNode => ({
  props: {
    ...surveyNodeTypeDefinitionMap[SurveyNodeType.Page].createDefaultProps(),
    children: [],
    id: crypto.randomUUID(),
  },
  type: SurveyNodeType.Page,
});

describe(useSurveyCreatorStore, () => {
  test("selects the node a pointer names, and selects nothing for a pointer that names no node", () => {
    expect.hasAssertions();

    setActivePinia(createPinia());
    const surveyCreatorStore = useSurveyCreatorStore();
    const { selectedNode, selectedPointer } = storeToRefs(surveyCreatorStore);
    const { load } = surveyCreatorStore;
    load(createSurveyDocument());
    selectedPointer.value = "/content/0";

    expect(selectedNode.value?.type).toBe(SurveyNodeType.Page);

    selectedPointer.value = "/content/1";

    expect(selectedPointer.value).toBe("");
  });

  test("keeps the selected node selected at its new pointer when the document changes under it", () => {
    expect.hasAssertions();

    setActivePinia(createPinia());
    const surveyCreatorStore = useSurveyCreatorStore();
    const { document, history, selectedPointer } = storeToRefs(surveyCreatorStore);
    const { commit, load } = surveyCreatorStore;
    const first = createPage();
    const second = createPage();
    load({ ...createSurveyDocument(), content: [first, second] });
    selectedPointer.value = "/content/1";
    commit({ ...document.value, content: [second, first] }, history.value);

    expect(selectedPointer.value).toBe("/content/0");
  });
});
