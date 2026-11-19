// @vitest-environment nuxt
import type { VueWrapper } from "@vue/test-utils";
import type { z } from "zod";

import ResourceSurveyCreatorChoiceListEditor from "#src/components/Resource/Survey/Creator/ChoiceListEditor.vue";
import ResourceSurveyCreatorImageChoicesEditor from "#src/components/Resource/Survey/Creator/ImageChoicesEditor.vue";
import ResourceSurveyCreatorImageUpload from "#src/components/Resource/Survey/Creator/ImageUpload.vue";
import ResourceSurveyCreatorProperties from "#src/components/Resource/Survey/Creator/Properties.vue";
import UiSchemaForm from "#src/components/Ui/SchemaForm/Index.vue";
import UiSelect from "#src/components/Ui/Select/Index.vue";
import { useSurveyCreatorStore } from "#src/store/survey/creator";
import { takeOne } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";
import { surveyDocumentSchema, SurveyNodeType } from "vue-survey-engine-headless";

// The keys a form draws, which are the keys of the schema it is given
const getDrawnKeys = (wrapper: VueWrapper) => {
  const schema: z.ZodObject = Reflect.get(wrapper.getComponent(UiSchemaForm).props(), "schema");
  return Object.keys(schema.shape);
};

// The options a select is given, read from its props
const getSelectItems = (uiSelect: VueWrapper) =>
  (uiSelect.props() as { items: { title: string; value: string }[] }).items;

// The select a rating's first step is drawn by: the one whose options include zero, which no other select of a rating offers
const findFirstStepSelect = (wrapper: VueWrapper) =>
  takeOne(
    wrapper
      .findAllComponents(UiSelect)
      .filter((uiSelect) => getSelectItems(uiSelect).some(({ value }) => value === "0")),
    0,
  );

// A page holding one question of the given kind, which the panel edits once it is selected
const createSurveyDocument = (type: SurveyNodeType = SurveyNodeType.RadioGroup, props: Record<string, unknown> = {}) =>
  surveyDocumentSchema.parse({
    content: [
      {
        props: {
          children: [{ props: { id: "question", name: "question", ...props }, type }],
          enableIf: "",
          id: "page",
        },
        type: SurveyNodeType.Page,
      },
    ],
    root: { props: { backgroundImage: "", title: "Survey" } },
  });

describe("resourceSurveyCreatorProperties", () => {
  test("a form edit writes the props it changed", async () => {
    expect.hasAssertions();
    const surveyCreatorStore = useSurveyCreatorStore();
    const { document: surveyDocument } = storeToRefs(surveyCreatorStore);
    const { load } = surveyCreatorStore;
    load(createSurveyDocument());
    const { select } = useSurveyCreatorCommands();
    select("/content/0/props/children/0");
    const wrapper = await mountSuspended(ResourceSurveyCreatorProperties);
    const question = takeOne(takeOne(surveyDocument.value.content, 0).props.children, 0);
    const renamedProps = { ...question.props, name: "renamed" };
    wrapper.getComponent(UiSchemaForm).vm.$emit("update:modelValue", renamedProps);
    await wrapper.vm.$nextTick();

    expect(takeOne(takeOne(surveyDocument.value.content, 0).props.children, 0).props).toStrictEqual(renamedProps);
  });

  test("a value the schema refuses stays in the form and is not written", async () => {
    expect.hasAssertions();
    const surveyCreatorStore = useSurveyCreatorStore();
    const { document: surveyDocument } = storeToRefs(surveyCreatorStore);
    const { load } = surveyCreatorStore;
    load(createSurveyDocument());
    const { select } = useSurveyCreatorCommands();
    select("/content/0/props/children/0");
    const wrapper = await mountSuspended(ResourceSurveyCreatorProperties);
    const question = takeOne(takeOne(surveyDocument.value.content, 0).props.children, 0);
    const initialProps = { ...question.props };
    wrapper.getComponent(UiSchemaForm).vm.$emit("update:modelValue", { ...question.props, name: "a{b" });
    await wrapper.vm.$nextTick();

    expect(takeOne(takeOne(surveyDocument.value.content, 0).props.children, 0).props).toStrictEqual(initialProps);
  });

  test("a rating's form offers zero and one as its first step", async () => {
    expect.hasAssertions();
    const surveyCreatorStore = useSurveyCreatorStore();
    const { load } = surveyCreatorStore;
    load(createSurveyDocument(SurveyNodeType.Rating, { rateMin: 1 }));
    const { select } = useSurveyCreatorCommands();
    select("/content/0/props/children/0");
    const wrapper = await mountSuspended(ResourceSurveyCreatorProperties);

    expect(getSelectItems(findFirstStepSelect(wrapper)).map(({ title, value }) => ({ title, value }))).toStrictEqual([
      { title: "0", value: "0" },
      { title: "1", value: "1" },
    ]);
  });

  test("choosing a first step writes it to the question as a number", async () => {
    expect.hasAssertions();
    const surveyCreatorStore = useSurveyCreatorStore();
    const { document: surveyDocument } = storeToRefs(surveyCreatorStore);
    const { load } = surveyCreatorStore;
    load(createSurveyDocument(SurveyNodeType.Rating, { rateMin: 1 }));
    const { select } = useSurveyCreatorCommands();
    select("/content/0/props/children/0");
    const wrapper = await mountSuspended(ResourceSurveyCreatorProperties);
    findFirstStepSelect(wrapper).vm.$emit("update:modelValue", "0");
    await wrapper.vm.$nextTick();

    expect(Reflect.get(takeOne(takeOne(surveyDocument.value.content, 0).props.children, 0).props, "rateMin")).toBe(0);
  });

  test("a question's choices are drawn by the list editor, not the form", async () => {
    expect.hasAssertions();
    const surveyCreatorStore = useSurveyCreatorStore();
    const { load } = surveyCreatorStore;
    load(createSurveyDocument());
    const { select } = useSurveyCreatorCommands();
    select("/content/0/props/children/0");
    const wrapper = await mountSuspended(ResourceSurveyCreatorProperties);

    expect(getDrawnKeys(wrapper)).not.toContain("choices");
    expect(wrapper.findComponent(ResourceSurveyCreatorChoiceListEditor).exists()).toBe(true);
  });

  test("an image question draws its upload editor beside its form, for the question at the selection", async () => {
    expect.hasAssertions();
    const surveyCreatorStore = useSurveyCreatorStore();
    const { load } = surveyCreatorStore;
    load(createSurveyDocument(SurveyNodeType.Image));
    const { select } = useSurveyCreatorCommands();
    select("/content/0/props/children/0");
    const wrapper = await mountSuspended(ResourceSurveyCreatorProperties);

    expect(wrapper.findComponent(ResourceSurveyCreatorImageUpload).props("pointer")).toBe(
      "/content/0/props/children/0",
    );
    expect(wrapper.findComponent(ResourceSurveyCreatorImageChoicesEditor).exists()).toBe(false);
  });

  test("an image picker draws its choices editor, and its form leaves the choices to that editor", async () => {
    expect.hasAssertions();
    const surveyCreatorStore = useSurveyCreatorStore();
    const { load } = surveyCreatorStore;
    load(createSurveyDocument(SurveyNodeType.ImagePicker));
    const { select } = useSurveyCreatorCommands();
    select("/content/0/props/children/0");
    const wrapper = await mountSuspended(ResourceSurveyCreatorProperties);

    expect(getDrawnKeys(wrapper)).not.toContain("choices");
    expect(wrapper.findComponent(ResourceSurveyCreatorImageChoicesEditor).props("pointer")).toBe(
      "/content/0/props/children/0",
    );
    expect(wrapper.findComponent(ResourceSurveyCreatorImageUpload).exists()).toBe(false);
  });

  test("a text question draws neither image editor", async () => {
    expect.hasAssertions();
    const surveyCreatorStore = useSurveyCreatorStore();
    const { load } = surveyCreatorStore;
    load(createSurveyDocument(SurveyNodeType.Text));
    const { select } = useSurveyCreatorCommands();
    select("/content/0/props/children/0");
    const wrapper = await mountSuspended(ResourceSurveyCreatorProperties);

    expect(wrapper.findComponent(ResourceSurveyCreatorImageUpload).exists()).toBe(false);
    expect(wrapper.findComponent(ResourceSurveyCreatorImageChoicesEditor).exists()).toBe(false);
  });

  test("with nothing selected, the root's form writes the survey's own texts", async () => {
    expect.hasAssertions();
    const surveyCreatorStore = useSurveyCreatorStore();
    const { document: surveyDocument } = storeToRefs(surveyCreatorStore);
    const { load } = surveyCreatorStore;
    load(createSurveyDocument());
    const { select } = useSurveyCreatorCommands();
    select("");
    const wrapper = await mountSuspended(ResourceSurveyCreatorProperties);
    const rootKeys = getDrawnKeys(wrapper);
    const renamedRootProps = { ...surveyDocument.value.root.props, title: "Renamed survey" };
    wrapper.getComponent(UiSchemaForm).vm.$emit("update:modelValue", renamedRootProps);
    await wrapper.vm.$nextTick();

    expect(rootKeys).toContain("title");
    expect(rootKeys).not.toContain("logo");
    expect(rootKeys).not.toContain("backgroundImage");
    expect(rootKeys).not.toContain("calculatedValues");
    expect(surveyDocument.value.root.props).toStrictEqual(renamedRootProps);
  });
});
