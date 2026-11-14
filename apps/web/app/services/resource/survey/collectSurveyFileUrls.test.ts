import { collectSurveyFileUrls } from "@/services/resource/survey/collectSurveyFileUrls";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";
import { surveyDocumentSchema, SurveyNodeType } from "vue-survey-engine-headless";

// Each node takes a fresh id, which the document schema requires to be unique
const createImage = (imageLink: string) => ({
  props: { id: v7(), imageLink, name: "image" },
  type: SurveyNodeType.Image,
});
const createPicker = (imageLinks: string[]) => ({
  props: {
    choices: imageLinks.map((imageLink) => ({ imageLink, text: "", value: imageLink })),
    id: v7(),
    name: "picker",
  },
  type: SurveyNodeType.ImagePicker,
});
const createPage = (children: unknown[]) => ({ props: { children, id: v7() }, type: SurveyNodeType.Page });

describe(collectSurveyFileUrls, () => {
  test("a survey's files are its logo and its pictures, sorted, each once and without the empty ones", () => {
    expect.hasAssertions();

    const document = surveyDocumentSchema.parse({
      content: [createPage([createImage("b"), createImage(""), createPicker(["a", "b"])])],
      root: { props: { logo: "c" } },
    });

    expect(collectSurveyFileUrls(document)).toStrictEqual(["a", "b", "c"]);
  });

  test("a picture inside a panel or a dynamic panel's template is a file of the survey", () => {
    expect.hasAssertions();

    const panel = { props: { children: [createImage("d")], id: v7() }, type: SurveyNodeType.Panel };
    const dynamicPanel = {
      props: { id: v7(), name: "dynamic", template: [createImage("e")] },
      type: SurveyNodeType.PanelDynamic,
    };
    const document = surveyDocumentSchema.parse({ content: [createPage([panel, dynamicPanel])], root: { props: {} } });

    expect(collectSurveyFileUrls(document)).toStrictEqual(["d", "e"]);
  });
});
