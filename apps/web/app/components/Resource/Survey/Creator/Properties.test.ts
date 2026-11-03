// @vitest-environment nuxt
import ResourceSurveyCreatorChoiceListEditor from "@/components/Resource/Survey/Creator/ChoiceListEditor.vue";
import ResourceSurveyCreatorProperties from "@/components/Resource/Survey/Creator/Properties.vue";
import UiSchemaForm from "@/components/Ui/SchemaForm/Index.vue";
import { useSurveyCreatorStore } from "@/store/survey/creator";
import { takeOne } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import {
  surveyDocumentSchema,
  SurveyNodeType,
  surveyNodeTypeDefinitionMap,
  surveyRootPropsSchema,
} from "survey-engine";
import { describe, expect, test } from "vitest";

// A page holding one radio group, which the panel edits once it is selected
const createSurveyDocument = () =>
  surveyDocumentSchema.parse({
    content: [
      {
        props: {
          children: [{ props: { id: "question", name: "question" }, type: SurveyNodeType.RadioGroup }],
          id: "page",
        },
        type: SurveyNodeType.Page,
      },
    ],
    root: { props: { title: "Survey" } },
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
    wrapper.getComponent(UiSchemaForm).vm.$emit("update:modelValue", { ...question.props, name: "renamed" });
    await wrapper.vm.$nextTick();

    expect(takeOne(takeOne(surveyDocument.value.content, 0).props.children, 0).props).toStrictEqual({
      choices: [],
      choicesOrder: "none",
      description: "",
      enableIf: "",
      hasNone: false,
      hasOther: false,
      id: "question",
      isRequired: false,
      name: "renamed",
      noneText: "",
      otherText: "",
      requiredErrorText: "",
      requiredIf: "",
      title: "",
      validators: [],
      visibleIf: "",
    });
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
    wrapper.getComponent(UiSchemaForm).vm.$emit("update:modelValue", { ...question.props, name: "a{b" });
    await wrapper.vm.$nextTick();

    expect(takeOne(takeOne(surveyDocument.value.content, 0).props.children, 0).props).toStrictEqual({
      choices: [],
      choicesOrder: "none",
      description: "",
      enableIf: "",
      hasNone: false,
      hasOther: false,
      id: "question",
      isRequired: false,
      name: "question",
      noneText: "",
      otherText: "",
      requiredErrorText: "",
      requiredIf: "",
      title: "",
      validators: [],
      visibleIf: "",
    });
  });

  test("a question's choices are drawn by the list editor, not the form", async () => {
    expect.hasAssertions();
    const surveyCreatorStore = useSurveyCreatorStore();
    const { load } = surveyCreatorStore;
    load(createSurveyDocument());
    const { select } = useSurveyCreatorCommands();
    select("/content/0/props/children/0");
    const wrapper = await mountSuspended(ResourceSurveyCreatorProperties);

    expect(JSON.stringify(Reflect.get(wrapper.getComponent(UiSchemaForm).props(), "schema"))).not.toContain(
      '"choices"',
    );
    expect(wrapper.findComponent(ResourceSurveyCreatorChoiceListEditor).exists()).toBe(true);
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
    const rootSchema = JSON.stringify(Reflect.get(wrapper.getComponent(UiSchemaForm).props(), "schema"));
    wrapper
      .getComponent(UiSchemaForm)
      .vm.$emit("update:modelValue", { ...surveyDocument.value.root.props, title: "Renamed survey" });
    await wrapper.vm.$nextTick();

    expect(rootSchema).toContain('"title"');
    expect(rootSchema).not.toContain('"logo"');
    expect(rootSchema).not.toContain('"calculatedValues"');
    expect(surveyDocument.value.root.props).toStrictEqual({
      accentColor: "",
      backgroundColor: "",
      calculatedValues: [],
      completedHtml: "",
      completeText: "",
      description: "",
      logo: "",
      pageNextText: "",
      pagePrevText: "",
      showProgressBar: "off",
      showQuestionNumbers: false,
      title: "Renamed survey",
    });
  });

  // Each kind's form draws exactly the fields its props schema holds, so a setting cannot appear or vanish without the
  // Schema saying so
  test.each([
    [
      SurveyNodeType.Boolean,
      [
        "description",
        "displayStyle",
        "enableIf",
        "isRequired",
        "labelFalse",
        "labelTrue",
        "name",
        "requiredErrorText",
        "requiredIf",
        "title",
        "validators",
        "visibleIf",
      ],
    ],
    [
      SurveyNodeType.ButtonGroup,
      [
        "choices",
        "description",
        "enableIf",
        "isRequired",
        "name",
        "requiredErrorText",
        "requiredIf",
        "title",
        "validators",
        "visibleIf",
      ],
    ],
    [
      SurveyNodeType.Checkbox,
      [
        "choices",
        "choicesOrder",
        "description",
        "enableIf",
        "hasNone",
        "hasOther",
        "hasSelectAll",
        "isRequired",
        "maxSelected",
        "minSelected",
        "name",
        "noneText",
        "otherText",
        "requiredErrorText",
        "requiredIf",
        "selectAllText",
        "title",
        "validators",
        "visibleIf",
      ],
    ],
    [
      SurveyNodeType.Comment,
      [
        "description",
        "enableIf",
        "isRequired",
        "maxLength",
        "name",
        "placeholder",
        "requiredErrorText",
        "requiredIf",
        "rows",
        "title",
        "validators",
        "visibleIf",
      ],
    ],
    [
      SurveyNodeType.Dropdown,
      [
        "choices",
        "choicesOrder",
        "description",
        "enableIf",
        "hasOther",
        "isRequired",
        "name",
        "otherText",
        "placeholder",
        "requiredErrorText",
        "requiredIf",
        "title",
        "validators",
        "visibleIf",
      ],
    ],
    [
      SurveyNodeType.Expression,
      [
        "description",
        "displayFormat",
        "enableIf",
        "expression",
        "isRequired",
        "maxFractionDigits",
        "name",
        "requiredErrorText",
        "requiredIf",
        "title",
        "validators",
        "visibleIf",
      ],
    ],
    [SurveyNodeType.Html, ["html", "name", "visibleIf"]],
    [SurveyNodeType.Image, ["altText", "imageFit", "imageHeight", "imageLink", "imageWidth", "name", "visibleIf"]],
    [
      SurveyNodeType.ImagePicker,
      [
        "choices",
        "description",
        "enableIf",
        "imageFit",
        "imageHeight",
        "imageWidth",
        "isRequired",
        "multiSelect",
        "name",
        "requiredErrorText",
        "requiredIf",
        "showLabel",
        "title",
        "validators",
        "visibleIf",
      ],
    ],
    [
      SurveyNodeType.Matrix,
      [
        "columns",
        "description",
        "enableIf",
        "isAllRowRequired",
        "isRequired",
        "name",
        "requiredErrorText",
        "requiredIf",
        "rows",
        "title",
        "validators",
        "visibleIf",
      ],
    ],
    [
      SurveyNodeType.MatrixDynamic,
      [
        "addRowText",
        "columns",
        "description",
        "enableIf",
        "isRequired",
        "maxRowCount",
        "minRowCount",
        "name",
        "removeRowText",
        "requiredErrorText",
        "requiredIf",
        "rowCount",
        "title",
        "validators",
        "visibleIf",
      ],
    ],
    [
      SurveyNodeType.MultipleText,
      [
        "description",
        "enableIf",
        "isRequired",
        "items",
        "name",
        "requiredErrorText",
        "requiredIf",
        "title",
        "validators",
        "visibleIf",
      ],
    ],
    [SurveyNodeType.Page, ["description", "title", "visibleIf"]],
    [SurveyNodeType.Panel, ["description", "enableIf", "title", "visibleIf"]],
    [
      SurveyNodeType.PanelDynamic,
      [
        "addPanelText",
        "description",
        "enableIf",
        "isRequired",
        "maxPanelCount",
        "minPanelCount",
        "name",
        "panelCount",
        "removePanelText",
        "requiredErrorText",
        "requiredIf",
        "title",
        "validators",
        "visibleIf",
      ],
    ],
    [
      SurveyNodeType.RadioGroup,
      [
        "choices",
        "choicesOrder",
        "description",
        "enableIf",
        "hasNone",
        "hasOther",
        "isRequired",
        "name",
        "noneText",
        "otherText",
        "requiredErrorText",
        "requiredIf",
        "title",
        "validators",
        "visibleIf",
      ],
    ],
    [
      SurveyNodeType.Ranking,
      [
        "choices",
        "description",
        "enableIf",
        "isRequired",
        "name",
        "requiredErrorText",
        "requiredIf",
        "title",
        "validators",
        "visibleIf",
      ],
    ],
    [
      SurveyNodeType.Rating,
      [
        "description",
        "enableIf",
        "isRequired",
        "maxRateDescription",
        "minRateDescription",
        "name",
        "rateCount",
        "rateType",
        "requiredErrorText",
        "requiredIf",
        "title",
        "validators",
        "visibleIf",
      ],
    ],
    [
      SurveyNodeType.Slider,
      [
        "description",
        "enableIf",
        "isRequired",
        "max",
        "min",
        "name",
        "requiredErrorText",
        "requiredIf",
        "showValue",
        "step",
        "title",
        "validators",
        "visibleIf",
      ],
    ],
    [
      SurveyNodeType.TagBox,
      [
        "choices",
        "choicesOrder",
        "description",
        "enableIf",
        "hasOther",
        "isRequired",
        "maxSelected",
        "name",
        "otherText",
        "placeholder",
        "requiredErrorText",
        "requiredIf",
        "title",
        "validators",
        "visibleIf",
      ],
    ],
    [
      SurveyNodeType.Text,
      [
        "description",
        "enableIf",
        "inputType",
        "isRequired",
        "max",
        "maxLength",
        "min",
        "minLength",
        "name",
        "pattern",
        "placeholder",
        "requiredErrorText",
        "requiredIf",
        "title",
        "validators",
        "visibleIf",
      ],
    ],
  ])("%s's form draws the fields its props schema holds", (type, fields) => {
    expect.hasAssertions();
    expect(Object.keys(surveyNodeTypeDefinitionMap[type].formSchema.shape).toSorted()).toStrictEqual(fields.toSorted());
  });

  test("the root's props schema holds the texts, the theme and the calculated values the panels split", () => {
    expect.hasAssertions();
    expect(Object.keys(surveyRootPropsSchema.shape).toSorted()).toStrictEqual(
      [
        "accentColor",
        "backgroundColor",
        "calculatedValues",
        "completedHtml",
        "completeText",
        "description",
        "logo",
        "pageNextText",
        "pagePrevText",
        "showProgressBar",
        "showQuestionNumbers",
        "title",
      ].toSorted(),
    );
  });
});
